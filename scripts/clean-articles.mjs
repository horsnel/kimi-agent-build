import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'data', 'articles');

// ── Config ──
const CONCURRENCY = 8;       // Parallel LLM calls
const MAX_RETRIES = 2;

// ── Classify articles ──
function classifyArticles() {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const junk = [];
  const empty = [];
  const good = [];

  for (const f of files) {
    const art = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
    const content = art.content || {};

    if (typeof content === 'object' && content !== null) {
      const body = content.body || [];
      const intro = content.introduction || '';
      const allText = intro + ' ' + (Array.isArray(body) ? body.join(' ') : String(body));
      const hashtagCount = (allText.match(/#/g) || []).length;

      if (allText.trim().length < 100) {
        empty.push({ file: f, article: art });
      } else if (hashtagCount > 10) {
        junk.push({ file: f, article: art, hashtagCount });
      } else {
        good.push(f);
      }
    } else if (typeof content === 'string') {
      if (content.trim().length < 100) {
        empty.push({ file: f, article: art });
      } else if ((content.match(/#/g) || []).length > 10) {
        junk.push({ file: f, article: art, hashtagCount: (content.match(/#/g) || []).length });
      } else {
        good.push(f);
      }
    } else {
      empty.push({ file: f, article: art });
    }
  }

  return { junk, empty, good };
}

// ── Build prompt for regeneration ──
function buildPrompt(article, type) {
  const title = article.title || 'Financial Article';
  const category = article.category || 'Markets';
  const excerpt = article.excerpt || '';
  const metaDesc = article.metaDescription || '';
  const tags = (article.tags || []).join(', ');
  const artType = article.type || 'news';
  
  // Get existing content hints
  const existingContent = article.content || {};
  let existingIntro = '';
  let existingBodyHints = [];
  
  if (typeof existingContent === 'object' && existingContent !== null) {
    existingIntro = existingContent.introduction || '';
    existingBodyHints = Array.isArray(existingContent.body) 
      ? existingContent.body.slice(0, 5).map(b => String(b).replace(/#/g, '').trim()).filter(b => b.length > 20)
      : [];
  }

  if (type === 'empty') {
    // Educational article - write from scratch
    return `You are a professional financial writer for Sigma Capital, a premium finance platform.

Write a comprehensive, educational article about: "${title}"
Category: ${category}
Tags: ${tags}

REQUIREMENTS:
- Write 800-1200 words of clean, professional financial content
- Use proper paragraphs with full sentences (3-5 sentences minimum per paragraph)
- NO hashtags, NO bullet-only sections, NO fragmented sentences
- Structure: Introduction → 3-4 main sections with clear subheadings → Conclusion
- Include specific examples, numbers, and data where relevant
- Professional tone suitable for investors and finance professionals
- Each section should have substantial content (150+ words)

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "introduction": "A compelling 2-3 sentence introduction paragraph...",
  "body": [
    "## Section Title\\n\\nFull paragraph content here with detailed analysis and examples. Multiple sentences that flow naturally and provide real value to the reader...",
    "## Next Section Title\\n\\nMore detailed content..."
  ]
}`;
  }

  // Junk article - rewrite based on title/context
  return `You are a professional financial writer for Sigma Capital, a premium finance platform.

REWRITE this article into clean, professional content. The original was scraped and is full of hashtags and fragmented text.

TITLE: ${title}
CATEGORY: ${category}
TYPE: ${artType}
${excerpt ? `SUMMARY HINT: ${excerpt}` : ''}
${metaDesc ? `META: ${metaDesc}` : ''}
${existingIntro ? `ORIGINAL INTRO (for context only, rewrite it): ${existingIntro.substring(0, 300)}` : ''}
${tags ? `TOPICS: ${tags}` : ''}

REQUIREMENTS:
- Write 600-1000 words of clean, professional financial content
- Use proper paragraphs with full sentences (3-5 sentences minimum per paragraph)
- NO hashtags (#) anywhere - this is a professional article, not social media
- NO fragmented sentences or bullet-only sections
- Structure: Introduction → 2-4 main sections with subheadings → Conclusion/takeaway
- Include specific data points, analyst opinions, or market context where the title suggests it
- Professional tone suitable for investors
- Each paragraph must be substantive (3+ sentences)

Return ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "introduction": "A compelling 2-3 sentence introduction...",
  "body": [
    "## Section Title\\n\\nFull paragraph with detailed analysis...",
    "## Next Section\\n\\nMore detailed content..."
  ]
}`;
}

// ── Parse LLM response ──
function parseResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to extract JSON from the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

// ── Process single article ──
async function regenerateArticle(zai, item, type) {
  const { file, article } = item;
  const prompt = buildPrompt(article, type);
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional financial content writer. Always respond with valid JSON only. No markdown code fences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = result.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      const parsed = parseResponse(content);
      if (!parsed || !parsed.introduction || !parsed.body || !Array.isArray(parsed.body)) {
        throw new Error('Invalid JSON structure');
      }

      // Validate quality
      const allText = parsed.introduction + ' ' + parsed.body.join(' ');
      const hashtagCount = (allText.match(/#/g) || []).length;
      if (hashtagCount > 5) {
        throw new Error(`Still has ${hashtagCount} hashtags, retrying`);
      }

      // Update article
      article.content = {
        introduction: parsed.introduction,
        body: parsed.body
      };
      
      // Update reading time
      const wordCount = allText.split(/\s+/).length;
      article.readingTime = Math.max(3, Math.ceil(wordCount / 200));

      // Save
      fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2));
      return { success: true, file, words: wordCount };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error(`  ❌ FAILED ${file}: ${err.message}`);
        return { success: false, file, error: err.message };
      }
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

// ── Process batch with concurrency ──
async function processBatch(zai, items, type, batchSize = CONCURRENCY) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} articles)...`);
    
    const batchResults = await Promise.all(
      batch.map(item => regenerateArticle(zai, item, type))
    );
    results.push(...batchResults);
    
    const succeeded = batchResults.filter(r => r.success).length;
    console.log(`  ✅ ${succeeded}/${batch.length} succeeded`);
  }
  return results;
}

// ── Main ──
async function main() {
  console.log('🔍 Classifying articles...');
  const { junk, empty, good } = classifyArticles();
  
  console.log(`\n📊 Classification Results:`);
  console.log(`  ✅ Good: ${good.length}`);
  console.log(`  🗑️  Junk (hashtag/fragmented): ${junk.length}`);
  console.log(`  📄 Empty: ${empty.length}`);
  console.log(`  📝 Total to fix: ${junk.length + empty.length}`);

  const zai = await ZAI.create();
  const startTime = Date.now();

  // Process junk articles first (higher priority)
  if (junk.length > 0) {
    console.log(`\n🧹 Cleaning ${junk.length} junk articles...`);
    const junkResults = await processBatch(zai, junk, 'junk');
    const junkSuccess = junkResults.filter(r => r.success).length;
    console.log(`\n  Junk: ${junkSuccess}/${junk.length} cleaned`);
  }

  // Process empty articles
  if (empty.length > 0) {
    console.log(`\n📝 Generating ${empty.length} empty articles...`);
    const emptyResults = await processBatch(zai, empty, 'empty');
    const emptySuccess = emptyResults.filter(r => r.success).length;
    console.log(`\n  Empty: ${emptySuccess}/${empty.length} generated`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Completed in ${elapsed}s`);
  
  // Re-verify
  console.log(`\n🔍 Re-verifying...`);
  const { junk: remainingJunk, empty: remainingEmpty, good: finalGood } = classifyArticles();
  console.log(`  ✅ Good: ${finalGood.length}`);
  console.log(`  🗑️  Still junk: ${remainingJunk.length}`);
  console.log(`  📄 Still empty: ${remainingEmpty.length}`);
  
  if (remainingJunk.length > 0) {
    console.log(`\n  Remaining junk files:`);
    remainingJunk.forEach(r => console.log(`    - ${r.file} (${r.hashtagCount} hashtags)`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
