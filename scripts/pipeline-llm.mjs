#!/usr/bin/env node

/**
 * Sigma Capital — LLM Article Pipeline
 * 
 * Uses Z.ai SDK to rewrite/filter articles through LLM,
 * then pushes results to the Pipeline Worker API (Cloudflare KV).
 * 
 * Usage:
 *   node scripts/pipeline-llm.mjs --mode=rewrite    # Rewrite existing junk articles
 *   node scripts/pipeline-llm.mjs --mode=generate   # Generate new articles from topics
 *   node scripts/pipeline-llm.mjs --mode=sync       # Sync local articles to Worker KV
 *   node scripts/pipeline-llm.mjs --mode=quality    # Quality audit + rewrite bad ones
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'public', 'data', 'articles');
const PIPELINE_API = process.env.PIPELINE_API_URL || 'https://sigma-pipeline.odehebuka48.workers.dev';

// Parse args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, val] = arg.replace(/^--/, '').split('=');
  acc[key] = val || true;
  return acc;
}, {});

const MODE = args.mode || 'quality';
const MAX_ARTICLES = parseInt(args.max) || 10;
const DELAY_MS = parseInt(args.delay) || 3000;
const CONCURRENCY = parseInt(args.concurrency) || 1;

// ── Helpers ──

function countSocialHashtags(text) {
  const withoutHeadings = text.replace(/^#{1,6}\s/gm, '');
  return (withoutHeadings.match(/#\w+/g) || []).length;
}

function assessArticleQuality(art) {
  const content = art.content || {};
  const body = content.body || [];
  const intro = content.introduction || '';
  
  // Get all text
  const allTextParts = [intro];
  if (Array.isArray(body)) {
    allTextParts.push(...body.filter(b => typeof b === 'string'));
  }
  const allText = allTextParts.join(' ');
  
  let score = 100;
  const issues = [];
  
  // Check word count
  const wordCount = allText.split(/\s+/).length;
  if (wordCount < 100) { score -= 40; issues.push(`too-short(${wordCount}w)`); }
  else if (wordCount < 300) { score -= 15; issues.push(`short(${wordCount}w)`); }
  
  // Check hashtags
  const socialHashtags = countSocialHashtags(allText);
  if (socialHashtags > 5) { score -= 30; issues.push(`hashtags(${socialHashtags})`); }
  
  // Check for navigation/UI junk
  const navPatterns = /Table of Contents|Read more|Subscribe|IBD Digital|Start Here|Sign Up|Log In/i;
  if (navPatterns.test(allText)) { score -= 25; issues.push('nav-junk'); }
  
  // Check for garbage chars
  if (/\+\s*\.\s*\*\s*\.\s*\+/.test(allText)) { score -= 25; issues.push('garbage'); }
  
  // Check # count in body (scraped fragments)
  const totalHashes = body.reduce((sum, b) => sum + (typeof b === 'string' ? b.count('#') : 0), 0);
  if (totalHashes > 15) { score -= 20; issues.push(`heavy-hashes(${totalHashes})`); }
  
  // Short body items
  if (Array.isArray(body)) {
    const shortItems = body.filter(b => typeof b === 'string' && b.length < 80).length;
    if (shortItems > 3 && body.length > 3) { score -= 15; issues.push(`short-items(${shortItems})`); }
  }
  
  return { score, issues, needsRewrite: score < 70, wordCount };
}

// ── LLM Rewriting ──

async function rewriteArticle(zai, article) {
  const { title, category, type, excerpt, metaDescription, tags } = article;
  
  const prompt = `You are a professional financial writer for Sigma Capital (https://sigma-capital.pages.dev), a premium finance platform.

Write a professional financial article based on this topic.

TITLE: ${title}
CATEGORY: ${category || 'Markets'}
TYPE: ${type || 'news'}
${excerpt ? `SUMMARY: ${excerpt}` : ''}
${metaDescription ? `DESCRIPTION: ${metaDescription}` : ''}
${tags?.length ? `TOPICS: ${tags.join(', ')}` : ''}

RULES:
- Write 600-1000 words of clean, professional financial content
- Proper paragraphs with 3-5 sentences each
- Use markdown ## for section headings
- No social-media hashtags like #investing
- No website navigation text (Subscribe, Read more, etc.)
- Structure: Introduction then 2-4 sections with ## headings then Conclusion
- Include specific data points, analyst views, or market context
- Professional investor tone

Return ONLY valid JSON:
{"introduction":"2-3 sentence compelling intro","body":["## Section Heading\\n\\nParagraph content with detailed analysis...","## Next Section\\n\\nMore content with insights and data..."]}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You write professional finance articles. Output only valid JSON. Use ## for headings, never social-media #hashtags. No UI text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      let text = result.choices[0]?.message?.content || '';
      text = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      
      const parsed = JSON.parse(text);
      if (!parsed.introduction || !Array.isArray(parsed.body)) throw new Error('Invalid structure');
      
      const checkText = parsed.introduction + ' ' + parsed.body.join(' ');
      if (countSocialHashtags(checkText) > 3) throw new Error('Has social hashtags');
      if (/Table of Contents|Read more|Subscribe/i.test(checkText)) throw new Error('Has nav text');
      
      return { introduction: parsed.introduction, body: parsed.body };
    } catch (err) {
      if (err.message?.includes('429') && attempt < 2) {
        console.log(`    ⏳ Rate limited, waiting 20s...`);
        await new Promise(r => setTimeout(r, 20000));
      } else if (attempt < 2) {
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw err;
      }
    }
  }
  return null;
}

// ── Worker API ──

async function pushToWorkerAPI(articles) {
  const batchSize = 10;
  let synced = 0;
  
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    try {
      const resp = await fetch(`${PIPELINE_API}/api/articles/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: batch })
      });
      const data = await resp.json();
      synced += data.synced || 0;
      console.log(`  Pushed batch ${Math.floor(i/batchSize)+1}: ${data.synced || 0} articles`);
    } catch (err) {
      console.error(`  ❌ Push failed: ${err.message}`);
    }
  }
  
  return synced;
}

// ── Modes ──

async function qualityMode() {
  console.log('🔍 Quality Audit + Rewrite Mode');
  
  const zai = await ZAI.create();
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  // Audit all articles
  const toRewrite = [];
  let goodCount = 0;
  
  for (const f of files) {
    const art = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
    const quality = assessArticleQuality(art);
    if (quality.needsRewrite) {
      toRewrite.push({ file: f, article: art, quality });
    } else {
      goodCount++;
    }
  }
  
  console.log(`  Good: ${goodCount}, Needs rewrite: ${toRewrite.length}`);
  
  if (toRewrite.length === 0) {
    console.log('  ✅ All articles are good quality!');
    return;
  }
  
  // Sort by worst quality first
  toRewrite.sort((a, b) => a.quality.score - b.quality.score);
  const batch = toRewrite.slice(0, MAX_ARTICLES);
  console.log(`  Rewriting top ${batch.length} worst articles...`);
  
  let success = 0, failed = 0;
  const updatedArticles = [];
  
  for (const { file, article, quality } of batch) {
    console.log(`  📝 ${article.title?.substring(0, 60)}... (score: ${quality.score}, issues: ${quality.issues.join(',')})`);
    
    try {
      const rewritten = await rewriteArticle(zai, article);
      if (rewritten) {
        article.content = { introduction: rewritten.introduction, body: rewritten.body };
        const wordCount = (rewritten.introduction + ' ' + rewritten.body.join(' ')).split(/\s+/).length;
        article.readingTime = Math.max(3, Math.ceil(wordCount / 200));
        
        // Save locally
        fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2));
        updatedArticles.push(article);
        success++;
        console.log(`    ✅ Rewritten (${wordCount}w)`);
      } else {
        failed++;
      }
    } catch (err) {
      console.log(`    ❌ ${err.message.substring(0, 80)}`);
      failed++;
    }
    
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  
  console.log(`\n  Results: ✅ ${success} rewritten, ❌ ${failed} failed`);
  
  // Push to Worker API
  if (updatedArticles.length > 0) {
    console.log('\n📡 Pushing to Pipeline API...');
    const synced = await pushToWorkerAPI(updatedArticles);
    console.log(`  Pushed ${synced} articles to Worker KV`);
  }
}

async function generateMode() {
  console.log('📰 Generate New Articles Mode');
  
  const zai = await ZAI.create();
  
  const topics = [
    { title: `S&P 500 Weekly Outlook: Key Levels and Market Drivers`, category: 'Markets', tags: ['sp500', 'market-outlook', 'weekly'] },
    { title: `Federal Reserve Meeting Preview: What to Expect`, category: 'Federal Reserve', tags: ['fed', 'interest-rates', 'policy'] },
    { title: `Tech Earnings Analysis: Quarter in Review`, category: 'Technology', tags: ['earnings', 'tech', 'analysis'] },
    { title: `Cryptocurrency Market Update: BTC and ETH Price Action`, category: 'Crypto', tags: ['bitcoin', 'ethereum', 'crypto'] },
    { title: `Economic Indicators Watch: GDP, CPI, and Employment`, category: 'Economy', tags: ['gdp', 'inflation', 'jobs'] },
  ];
  
  const batch = topics.slice(0, MAX_ARTICLES);
  const generatedArticles = [];
  
  for (const topic of batch) {
    const slug = topic.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80);
    
    const article = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'news',
      title: topic.title,
      slug,
      date: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: topic.category,
      tags: topic.tags,
      metaDescription: '',
      excerpt: '',
      content: { introduction: '', body: [] },
      readingTime: 5,
      status: 'published'
    };
    
    console.log(`  📝 Generating: ${topic.title}`);
    
    try {
      const rewritten = await rewriteArticle(zai, article);
      if (rewritten) {
        article.content = { introduction: rewritten.introduction, body: rewritten.body };
        const wordCount = (rewritten.introduction + ' ' + rewritten.body.join(' ')).split(/\s+/).length;
        article.readingTime = Math.max(3, Math.ceil(wordCount / 200));
        generatedArticles.push(article);
        console.log(`    ✅ Generated (${wordCount}w)`);
      }
    } catch (err) {
      console.log(`    ❌ ${err.message.substring(0, 80)}`);
    }
    
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  
  // Save locally + push to API
  for (const art of generatedArticles) {
    const filePath = path.join(ARTICLES_DIR, `${art.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(art, null, 2));
  }
  
  if (generatedArticles.length > 0) {
    console.log(`\n📡 Pushing ${generatedArticles.length} articles to Pipeline API...`);
    const synced = await pushToWorkerAPI(generatedArticles);
    console.log(`  Pushed ${synced} articles to Worker KV`);
  }
}

async function syncMode() {
  console.log('🔄 Sync Mode — Push all local articles to Worker KV');
  
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const articles = [];
  
  for (const f of files) {
    const art = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
    if (art.slug) articles.push(art);
  }
  
  console.log(`  Found ${articles.length} local articles`);
  const synced = await pushToWorkerAPI(articles);
  console.log(`  ✅ Synced ${synced} articles to Worker KV`);
}

// ── Main ──

console.log(`\n🚀 Sigma Pipeline LLM — Mode: ${MODE}`);
console.log(`   Max articles: ${MAX_ARTICLES}, Delay: ${DELAY_MS}ms`);
console.log(`   Pipeline API: ${PIPELINE_API}\n`);

switch (MODE) {
  case 'quality':
    await qualityMode();
    break;
  case 'generate':
    await generateMode();
    break;
  case 'sync':
    await syncMode();
    break;
  default:
    console.error(`Unknown mode: ${MODE}. Use: quality, generate, sync`);
    process.exit(1);
}

console.log('\n✅ Pipeline complete!');
