#!/usr/bin/env node

/**
 * Sigma Capital — Article Enrichment Script
 * Uses AI (z-ai-web-dev-sdk via API) to expand short articles to 1500+ words
 * and generate proper images for articles with placeholder images.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'public/data/articles');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public/images/articles');

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function httpPost(url, body, headers = {}, timeout = 30000) {
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
          try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON: ' + data.substring(0, 200))); }
        } else { reject(new Error('HTTP ' + res.statusCode + ': ' + data.substring(0, 200))); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

function httpGet(url, headers = {}, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname, path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET', headers, timeout,
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(Buffer.concat(chunks));
        } else { reject(new Error('HTTP ' + res.statusCode)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// ── AI Content Generation via z-ai-web-dev-sdk API ───────────────────────────

async function generateEnrichedContent(article) {
  const prompt = `You are a senior financial journalist writing for Sigma Capital, a premium financial intelligence platform.

Expand the following short financial news article into a comprehensive, well-structured article of at least 1500 words. The article should be informative, professional, and provide deep analysis.

ORIGINAL TITLE: ${article.title}
CATEGORY: ${article.category}
CURRENT EXCERPT: ${article.excerpt}
CURRENT INTRODUCTION: ${article.content?.introduction || ''}
CURRENT BODY PARAGRAPHS: ${JSON.stringify(article.content?.body || [])}
KEY TAKEAWAYS: ${JSON.stringify(article.content?.keyTakeaways || [])}

REQUIREMENTS:
1. Write at least 1500 words total
2. Structure the output as JSON with these fields:
   - "introduction": A compelling opening paragraph (150-250 words) that hooks the reader and summarizes the key points
   - "body": An array of 6-10 substantial paragraphs (each 120-250 words) providing deep analysis, context, and implications
   - "keyTakeaways": An array of 5-7 key takeaway strings (each 20-40 words)
   - "outlook": A forward-looking analysis paragraph (100-200 words) about what to expect next
3. Use specific data points, numbers, and analysis where possible
4. Write in a professional, institutional-grade tone
5. Include market implications and investor takeaways
6. Do NOT use bullet points within body paragraphs — write flowing prose
7. Each body paragraph should be substantial and self-contained

Return ONLY the JSON object, no markdown fences or extra text.`;

  try {
    // Use z-ai-web-dev-sdk API endpoint
    const response = await httpPost('https://api.z.ai/v1/chat/completions', {
      model: 'glm-4-plus',
      messages: [
        { role: 'system', content: 'You are a senior financial journalist. Always respond with valid JSON only, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }, {
      'Authorization': 'Bearer z-ai-web-dev-sdk',
      'Content-Type': 'application/json',
    });

    const content = response.choices?.[0]?.message?.content || '';
    // Try to parse JSON from the response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding JSON object in the text
        const objMatch = content.match(/\{[\s\S]*\}/);
        if (objMatch) {
          parsed = JSON.parse(objMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }
    return parsed;
  } catch (err) {
    console.error(`  ✗ AI enrichment failed: ${err.message}`);
    return null;
  }
}

// ── Image Generation ──────────────────────────────────────────────────────────

async function generateArticleImage(slug, type, title) {
  const imagePath = path.join(IMAGES_DIR, `${slug}-${type}.jpg`);
  if (fs.existsSync(imagePath)) return true; // Already exists

  try {
    const prompt = type === 'hero'
      ? `Professional financial news hero image: ${title}. Dark sophisticated style, abstract data visualization, stock market charts, emerald and dark tones, premium editorial quality`
      : type === 'mid'
      ? `Professional financial analysis image: ${title}. Abstract market data visualization, clean modern design, dark background with emerald accents, editorial quality`
      : `Professional financial thumbnail: ${title}. Clean modern design, market data abstract, dark theme with emerald highlights`;

    const response = await httpPost('https://api.z.ai/v1/images/generations', {
      prompt,
      size: type === 'thumb' ? '1152x864' : '1344x768',
    }, {
      'Authorization': 'Bearer z-ai-web-dev-sdk',
      'Content-Type': 'application/json',
    });

    const base64 = response.data?.[0]?.base64;
    if (base64) {
      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(imagePath, buffer);
      console.log(`    ✓ Generated ${type} image for ${slug}`);
      return true;
    }
    return false;
  } catch (err) {
    console.log(`    ⚠ Image generation failed for ${slug}-${type}: ${err.message}`);
    return false;
  }
}

// ── Word count helper ─────────────────────────────────────────────────────────

function getWordCount(article) {
  let text = '';
  const c = article.content || {};
  if (c.introduction) text += c.introduction + ' ';
  if (Array.isArray(c.body)) text += c.body.join(' ') + ' ';
  if (c.outlook) text += c.outlook + ' ';
  if (c.definition) text += c.definition + ' ';
  if (c.example) text += c.example + ' ';
  if (c.whyItMatters) text += c.whyItMatters + ' ';
  if (Array.isArray(c.keyTakeaways)) text += c.keyTakeaways.join(' ') + ' ';
  if (Array.isArray(c.steps)) text += c.steps.map(s => s.heading + ' ' + s.body).join(' ') + ' ';
  if (Array.isArray(c.items)) text += c.items.map(i => i.name + ' ' + i.detail).join(' ') + ' ';
  if (c.investmentThesis) text += c.investmentThesis + ' ';
  if (c.risks) text += c.risks + ' ';
  if (Array.isArray(c.marketDrivers)) text += c.marketDrivers.join(' ') + ' ';
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function hasPlaceholderImages(article) {
  if (!article.images) return true;
  const { thumbnail, hero, mid } = article.images;
  return (thumbnail?.src?.includes('article_thumb_') || hero?.src?.includes('article_thumb_') || mid?.src?.includes('article_thumb_'));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('  SIGMA CAPITAL — Article Enrichment');
  console.log('='.repeat(60));

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error('❌ No articles directory found');
    process.exit(1);
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log(`\n📚 Found ${files.length} article files`);

  // Identify short articles and articles with placeholder images
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

  // ── Enrich short articles ────────────────────────────────────────────────
  if (shortArticles.length > 0) {
    console.log('\n📝 Enriching short articles with AI...');
    
    // Process in batches of 3 to avoid rate limits
    const batchSize = 3;
    let enriched = 0;
    
    for (let i = 0; i < shortArticles.length; i += batchSize) {
      const batch = shortArticles.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async ({ file, article }) => {
          const enrichedContent = await generateEnrichedContent(article);
          if (!enrichedContent) return { file, success: false };

          // Merge enriched content back into the article
          const updated = { ...article };
          updated.content = {
            ...updated.content,
            introduction: enrichedContent.introduction || updated.content?.introduction || '',
            body: enrichedContent.body || updated.content?.body || [],
            keyTakeaways: enrichedContent.keyTakeaways || updated.content?.keyTakeaways || [],
            outlook: enrichedContent.outlook || updated.content?.outlook || '',
          };

          // Update reading time
          const newWordCount = getWordCount(updated);
          updated.readingTime = Math.max(5, Math.ceil(newWordCount / 200));
          updated.metaDescription = (enrichedContent.introduction || updated.excerpt).substring(0, 160);
          updated.excerpt = (enrichedContent.introduction || updated.excerpt).substring(0, 300);
          updated.updatedAt = new Date().toISOString();

          // Save
          fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(updated, null, 2), 'utf8');
          return { file, success: true, wordCount: newWordCount };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          enriched++;
          console.log(`  ✓ [${enriched}/${shortArticles.length}] Enriched: ${result.value.file} (${result.value.wordCount} words)`);
        } else if (result.status === 'fulfilled') {
          console.log(`  ✗ Failed: ${result.value.file}`);
        } else {
          console.log(`  ✗ Error: ${result.reason?.message || 'unknown'}`);
        }
      }

      // Brief pause between batches
      if (i + batchSize < shortArticles.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`\n  ✓ Enriched ${enriched}/${shortArticles.length} articles`);
  }

  // ── Generate images for placeholder articles ────────────────────────────
  if (placeholderArticles.length > 0) {
    console.log(`\n🖼️  Generating images for ${placeholderArticles.length} articles...`);
    let imgGenerated = 0;

    // Only generate for first 30 to save time (others will keep placeholders)
    const toProcess = placeholderArticles.slice(0, 30);
    
    for (const { file, article } of toProcess) {
      const slug = article.slug;
      const needsHero = article.images?.hero?.src?.includes('article_thumb_');
      const needsMid = article.images?.mid?.src?.includes('article_thumb_');
      const needsThumb = article.images?.thumbnail?.src?.includes('article_thumb_');

      // Generate hero image first (most visible)
      if (needsHero) {
        const ok = await generateArticleImage(slug, 'hero', article.title);
        if (ok) {
          article.images.hero.src = `/images/articles/${slug}-hero.jpg`;
          imgGenerated++;
        }
      }

      // Generate mid image
      if (needsMid) {
        const ok = await generateArticleImage(slug, 'mid', article.title);
        if (ok) {
          article.images.mid.src = `/images/articles/${slug}-mid.jpg`;
          imgGenerated++;
        }
      }

      // Generate thumbnail
      if (needsThumb) {
        const ok = await generateArticleImage(slug, 'thumb', article.title);
        if (ok) {
          article.images.thumbnail.src = `/images/articles/${slug}-thumb.jpg`;
          imgGenerated++;
        }
      }

      // Update image field too
      if (article.images?.thumbnail?.src && !article.images.thumbnail.src.includes('article_thumb_')) {
        article.image = { src: article.images.thumbnail.src, alt: article.title };
      }

      // Save updated article
      fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2), 'utf8');
      
      // Brief pause
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`  ✓ Generated ${imgGenerated} images`);
  }

  // ── Rebuild index ───────────────────────────────────────────────────────
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

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
