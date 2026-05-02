#!/usr/bin/env node

/**
 * Sigma Capital — Article Enrichment Script
 * Enriches short articles (<1200 words) by fetching more content from source URLs
 * and expanding with additional research via Tavily.
 * Generates real images via z-ai-generate CLI.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'public/data/articles');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public/images/articles');

// API Keys
const TAVILY_KEY = process.env.TAVILY_API_KEY || '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';
const SERPER_KEYS = [
  process.env.SERPER_API_KEY_1 || '6fd449bbcb777831e0882326c37cb9ed28117fba',
  process.env.SERPER_API_KEY_2 || '6f1968541b63942a64663388edd51584501831ef',
].filter(Boolean);

function httpPost(url, body, headers = {}, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname, path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...headers },
      timeout,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
        } else { reject(new Error('HTTP ' + res.statusCode)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

function tavilySearch(query, maxResults = 5) {
  return httpPost('https://api.tavily.com/search', {
    api_key: TAVILY_KEY, query, max_results: maxResults, include_answer: true, search_depth: 'advanced'
  }).catch(e => { console.log('  ⚠ Tavily failed: ' + e.message); return null; });
}

function tavilyExtract(urls) {
  return httpPost('https://api.tavily.com/extract', {
    api_key: TAVILY_KEY, urls: Array.isArray(urls) ? urls : [urls]
  }).catch(e => { console.log('  ⚠ Tavily extract failed: ' + e.message); return null; });
}

function serperSearch(query, num = 5) {
  const key = SERPER_KEYS[Math.floor(Math.random() * SERPER_KEYS.length)];
  return httpPost('https://google.serper.dev/search', { q: query, num, gl: 'us', hl: 'en' }, { 'X-API-KEY': key })
    .catch(e => { console.log('  ⚠ Serper failed: ' + e.message); return null; });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getWordCount(article) {
  let text = '';
  const c = article.content || {};
  if (c.introduction) text += c.introduction + ' ';
  if (Array.isArray(c.body)) text += c.body.join(' ') + ' ';
  if (c.outlook) text += c.outlook + ' ';
  if (c.definition) text += c.definition + ' ';
  if (c.example) text += c.example + ' ';
  if (c.whyItMatters) text += c.whyItMatters + ' ';
  if (c.types) text += c.types + ' ';
  if (c.formula) text += c.formula + ' ';
  if (Array.isArray(c.keyTakeaways)) text += c.keyTakeaways.join(' ') + ' ';
  if (Array.isArray(c.steps)) text += c.steps.map(s => (s.heading || '') + ' ' + (s.body || '')).join(' ') + ' ';
  if (Array.isArray(c.items)) text += c.items.map(i => (i.name || '') + ' ' + (i.detail || '')).join(' ') + ' ';
  if (c.investmentThesis) text += c.investmentThesis + ' ';
  if (c.risks) text += c.risks + ' ';
  if (Array.isArray(c.marketDrivers)) text += c.marketDrivers.join(' ') + ' ';
  if (Array.isArray(c.keyStocks)) text += c.keyStocks.map(s => s.commentary || '').join(' ') + ' ';
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function hasPlaceholderImages(article) {
  if (!article.images) return true;
  return (article.images.thumbnail?.src?.includes('article_thumb_') ||
          article.images.hero?.src?.includes('article_thumb_') ||
          article.images.mid?.src?.includes('article_thumb_'));
}

// ── Enrich a single article with deeper research ──────────────────────────────

async function enrichArticle(article) {
  const title = article.title;
  const category = article.category;
  const sourceUrl = article.content?.sourceUrl || '';
  
  // 1. Extract content from the source URL
  let extractedText = [];
  if (sourceUrl) {
    try {
      const extractResult = await tavilyExtract([sourceUrl]);
      if (extractResult?.results) {
        for (const r of extractResult.results) {
          if (r.raw_content && r.raw_content.length > 200) {
            extractedText.push(r.raw_content);
          }
        }
      }
    } catch {}
  }
  
  // 2. Get deeper search results
  const searchQuery = `${title} analysis implications market impact`;
  const searchResult = await tavilySearch(searchQuery, 5);
  
  let additionalContent = [];
  if (searchResult?.answer) additionalContent.push(searchResult.answer);
  if (searchResult?.results) {
    additionalContent.push(...searchResult.results.map(r => r.content).filter(c => c && c.length > 100));
  }
  
  // 3. Combine and structure content
  const c = article.content || {};
  const existingIntro = c.introduction || '';
  const existingBody = Array.isArray(c.body) ? c.body : [];
  
  // Build enriched body paragraphs
  const newBody = [...existingBody];
  
  // Add extracted content as additional paragraphs (split long text into paragraphs)
  for (const text of extractedText) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 80 && p.trim().length < 2000);
    for (const p of paragraphs.slice(0, 4)) {
      if (!newBody.includes(p.trim())) {
        newBody.push(p.trim());
      }
    }
  }
  
  // Add additional search content
  for (const text of additionalContent) {
    if (text.length > 80 && !newBody.includes(text.trim())) {
      newBody.push(text.trim());
    }
  }
  
  // Ensure introduction is substantial
  let intro = existingIntro;
  if (intro.length < 200 && searchResult?.answer) {
    intro = searchResult.answer;
  }
  
  // Build outlook if missing
  let outlook = c.outlook || '';
  if (!outlook && searchResult?.results?.length > 0) {
    const lastResult = searchResult.results[searchResult.results.length - 1];
    if (lastResult?.content && lastResult.content.length > 100) {
      outlook = `Looking ahead, ${lastResult.content.substring(0, 300)}. Market participants will continue to monitor developments closely for signals about the direction of ${category.toLowerCase()} trends and their broader implications for portfolio allocation and risk management strategies.`;
    }
  }
  
  // Ensure key takeaways are substantial
  let keyTakeaways = Array.isArray(c.keyTakeaways) ? [...c.keyTakeaways] : [];
  if (keyTakeaways.length < 5) {
    // Generate more key takeaways from the content
    const allText = [intro, ...newBody, outlook].join(' ');
    const sentences = allText.split(/\.\s+/).filter(s => s.trim().length > 40);
    while (keyTakeaways.length < 5 && sentences.length > 0) {
      const sentence = sentences.shift() + '.';
      if (!keyTakeaways.includes(sentence) && sentence.length > 40 && sentence.length < 200) {
        keyTakeaways.push(sentence);
      }
    }
  }
  
  return {
    ...c,
    introduction: intro,
    body: newBody.slice(0, 12), // Cap at 12 paragraphs
    keyTakeaways: keyTakeaways.slice(0, 7),
    outlook,
  };
}

// ── Generate image using z-ai-generate CLI ────────────────────────────────────

function generateImage(slug, type, title) {
  const imagePath = path.join(IMAGES_DIR, `${slug}-${type}.jpg`);
  if (fs.existsSync(imagePath)) return true;

  const prompts = {
    hero: `Professional financial news hero image for article titled "${title}". Dark sophisticated style, abstract data visualization, stock market charts, emerald green and dark charcoal tones, premium editorial quality, cinematic wide format`,
    mid: `Professional financial analysis illustration for "${title}". Abstract market data visualization, graphs and charts, clean modern design, dark background with emerald green accents, editorial quality`,
    thumb: `Professional financial thumbnail for "${title}". Clean modern design, market data abstract, dark theme with emerald highlights, eye-catching composition`,
  };

  const sizes = { hero: '1344x768', mid: '1344x768', thumb: '1152x864' };

  try {
    execSync(`z-ai-generate -p "${prompts[type].replace(/"/g, '\\"')}" -o "${imagePath}" -s ${sizes[type]}`, {
      timeout: 60000,
      stdio: 'pipe',
    });
    if (fs.existsSync(imagePath)) {
      console.log(`    ✓ Generated ${type} image`);
      return true;
    }
    return false;
  } catch (err) {
    console.log(`    ⚠ Image gen failed (${type}): ${err.message?.substring(0, 80)}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('  SIGMA CAPITAL — Article Enrichment');
  console.log('='.repeat(60));

  const args = process.argv.slice(2);
  const enrichContent = !args.includes('--images-only');
  const enrichImages = !args.includes('--content-only');
  const maxArticles = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '200', 10);

  if (!fs.existsSync(ARTICLES_DIR)) { console.error('❌ No articles dir'); process.exit(1); }
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log(`\n📚 Found ${files.length} articles`);

  const shortArticles = [];
  const placeholderArticles = [];

  for (const file of files) {
    try {
      const article = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8'));
      const wc = getWordCount(article);
      if (wc < 1200) shortArticles.push({ file, article, wordCount: wc });
      if (hasPlaceholderImages(article)) placeholderArticles.push({ file, article });
    } catch {}
  }

  console.log(`  📝 Short articles (<1200 words): ${shortArticles.length}`);
  console.log(`  🖼️  Placeholder images: ${placeholderArticles.length}`);

  // ── Enrich content ────────────────────────────────────────────────────────
  if (enrichContent && shortArticles.length > 0) {
    console.log('\n📝 Enriching short articles with deeper research...');
    let enriched = 0;
    const toEnrich = shortArticles.slice(0, maxArticles);

    for (let i = 0; i < toEnrich.length; i++) {
      const { file, article } = toEnrich[i];
      try {
        const enrichedContent = await enrichArticle(article);
        article.content = enrichedContent;
        const newWC = getWordCount(article);
        article.readingTime = Math.max(5, Math.ceil(newWC / 200));
        article.metaDescription = (enrichedContent.introduction || article.excerpt || '').substring(0, 160);
        article.excerpt = (enrichedContent.introduction || article.excerpt || '').substring(0, 300);
        article.updatedAt = new Date().toISOString();

        fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2), 'utf8');
        enriched++;
        console.log(`  ✓ [${enriched}/${toEnrich.length}] ${article.title.substring(0, 50)}... (${newWC} words, ${article.readingTime} min)`);
      } catch (err) {
        console.log(`  ✗ [${i + 1}/${toEnrich.length}] ${article.title?.substring(0, 50)}... failed: ${err.message}`);
      }
      // Rate limit
      if ((i + 1) % 5 === 0) await sleep(1000);
    }
    console.log(`\n  ✓ Enriched ${enriched}/${toEnrich.length} articles`);
  }

  // ── Generate images ───────────────────────────────────────────────────────
  if (enrichImages && placeholderArticles.length > 0) {
    console.log(`\n🖼️  Generating images for articles with placeholders...`);
    let imgGenerated = 0;
    const toProcess = placeholderArticles.slice(0, 50); // Limit to save time

    for (let i = 0; i < toProcess.length; i++) {
      const { file, article } = toProcess[i];
      const slug = article.slug;
      let changed = false;

      // Generate hero image (most visible)
      if (article.images?.hero?.src?.includes('article_thumb_')) {
        if (generateImage(slug, 'hero', article.title)) {
          article.images.hero.src = `/images/articles/${slug}-hero.jpg`;
          changed = true; imgGenerated++;
        }
      }

      // Generate mid image
      if (article.images?.mid?.src?.includes('article_thumb_')) {
        if (generateImage(slug, 'mid', article.title)) {
          article.images.mid.src = `/images/articles/${slug}-mid.jpg`;
          changed = true; imgGenerated++;
        }
      }

      // Generate thumbnail
      if (article.images?.thumbnail?.src?.includes('article_thumb_')) {
        if (generateImage(slug, 'thumb', article.title)) {
          article.images.thumbnail.src = `/images/articles/${slug}-thumb.jpg`;
          changed = true; imgGenerated++;
        }
      }

      // Update image field
      if (article.images?.thumbnail?.src && !article.images.thumbnail.src.includes('article_thumb_')) {
        article.image = { src: article.images.thumbnail.src, alt: article.title };
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2), 'utf8');
      }

      if ((i + 1) % 10 === 0) console.log(`  Progress: ${i + 1}/${toProcess.length}`);
      await sleep(300);
    }
    console.log(`  ✓ Generated ${imgGenerated} images`);
  }

  // ── Rebuild index ─────────────────────────────────────────────────────────
  console.log('\n📇 Rebuilding article index...');
  const indexFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const index = [];
  for (const file of indexFiles) {
    try {
      const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8'));
      index.push({
        id: a.id || a.slug, type: a.type, title: a.title, slug: a.slug,
        date: a.date, displayDate: a.displayDate || a.date, category: a.category,
        tags: a.tags || [], metaDescription: a.metaDescription || '', excerpt: a.excerpt || '',
        image: a.image ? { src: a.image.src, alt: a.image.alt } : null,
        readingTime: a.readingTime || 5,
      });
    } catch {}
  }
  index.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(path.join(ARTICLES_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
  console.log(`  ✓ Indexed ${index.length} articles`);

  console.log('\n' + '='.repeat(60));
  console.log('  ✓ ARTICLE ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
