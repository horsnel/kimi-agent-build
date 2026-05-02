#!/usr/bin/env node

/**
 * Quick batch image generator for article images
 * Generates hero images for the most visible articles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'public/data/articles');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public/images/articles');

function generateImage(slug, type, title) {
  const imagePath = path.join(IMAGES_DIR, `${slug}-${type}.jpg`);
  if (fs.existsSync(imagePath)) return true;

  const prompts = {
    hero: `Financial news hero: "${title.substring(0, 60)}". Dark sophisticated, abstract data visualization, stock charts, emerald dark tones`,
    mid: `Financial analysis: "${title.substring(0, 60)}". Market data visualization, dark emerald accents, editorial`,
    thumb: `Financial thumbnail: "${title.substring(0, 60)}". Dark theme, emerald highlights, modern`,
  };
  const sizes = { hero: '1344x768', mid: '1344x768', thumb: '1152x864' };

  try {
    execSync(`z-ai-generate -p "${prompts[type].replace(/"/g, '\\"')}" -o "${imagePath}" -s ${sizes[type]}`, {
      timeout: 90000,
      stdio: 'pipe',
    });
    return fs.existsSync(imagePath);
  } catch {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const needsImages = [];
  
  for (const file of files) {
    try {
      const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8'));
      if (a.images?.hero?.src?.includes('article_thumb_')) needsImages.push({ file, article: a });
    } catch {}
  }
  
  console.log(`Generating images for ${needsImages.length} articles...`);
  let count = 0;
  
  for (const { file, article } of needsImages) {
    const slug = article.slug;
    let changed = false;
    
    // Hero image (most important)
    if (article.images?.hero?.src?.includes('article_thumb_') && generateImage(slug, 'hero', article.title)) {
      article.images.hero.src = `/images/articles/${slug}-hero.jpg`;
      changed = true;
    }
    
    // Mid image
    if (article.images?.mid?.src?.includes('article_thumb_') && generateImage(slug, 'mid', article.title)) {
      article.images.mid.src = `/images/articles/${slug}-mid.jpg`;
      changed = true;
    }
    
    // Thumbnail
    if (article.images?.thumbnail?.src?.includes('article_thumb_') && generateImage(slug, 'thumb', article.title)) {
      article.images.thumbnail.src = `/images/articles/${slug}-thumb.jpg`;
      changed = true;
    }
    
    if (changed) {
      if (article.images?.thumbnail?.src && !article.images.thumbnail.src.includes('article_thumb_')) {
        article.image = { src: article.images.thumbnail.src, alt: article.title };
      }
      fs.writeFileSync(path.join(ARTICLES_DIR, file), JSON.stringify(article, null, 2), 'utf8');
      count++;
      console.log(`✓ [${count}/${needsImages.length}] ${slug}`);
    }
  }
  
  console.log(`\n✓ Generated images for ${count} articles`);
}

main().catch(console.error);
