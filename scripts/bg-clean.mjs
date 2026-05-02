import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'data', 'articles');
const LOG_FILE = path.join(__dirname, '..', 'clean-progress.log');

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

async function main() {
  // Load junk list
  const junkFiles = JSON.parse(fs.readFileSync('/tmp/junk-articles.json', 'utf8'));
  log(`Starting cleanup of ${junkFiles.length} articles`);
  
  const zai = await ZAI.create();
  let success = 0, failed = 0;
  
  for (let i = 0; i < junkFiles.length; i++) {
    const file = junkFiles[i];
    const artPath = path.join(ARTICLES_DIR, file);
    
    if (!fs.existsSync(artPath)) {
      log(`SKIP ${file} (not found)`);
      continue;
    }
    
    const article = JSON.parse(fs.readFileSync(artPath, 'utf8'));
    const title = article.title || 'Financial Article';
    const category = article.category || 'Markets';
    const tags = (article.tags || []).join(', ');
    const artType = article.type || 'news';
    const excerpt = article.excerpt || '';
    
    const prompt = `You are a professional financial writer for Sigma Capital. REWRITE this scraped article into clean professional content.

TITLE: ${title}
CATEGORY: ${category} | TYPE: ${artType}
${excerpt ? `CONTEXT: ${excerpt}` : ''}

RULES: 600-1000 words, professional tone, proper paragraphs, ## for section headings, NO social hashtags (#investing etc), NO website UI text (Subscribe, Read more, etc). Include specific data and examples.

Return ONLY valid JSON: {"introduction":"2-3 sentence intro","body":["## Section\\n\\nParagraph...","## Section\\n\\nParagraph..."]}`;

    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      try {
        const result = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'Professional finance writer. Output only valid JSON. Use ## headings, no #hashtags, no UI text.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        let text = result.choices[0]?.message?.content || '';
        text = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(text);
        if (!parsed.introduction || !Array.isArray(parsed.body)) throw new Error('Bad structure');
        
        article.content = { introduction: parsed.introduction, body: parsed.body };
        // Preserve source info
        if (article.content?.source) article.content.source = article.content.source;
        
        const wordCount = (parsed.introduction + ' ' + parsed.body.join(' ')).split(/\s+/).length;
        article.readingTime = Math.max(3, Math.ceil(wordCount / 200));
        fs.writeFileSync(artPath, JSON.stringify(article, null, 2));
        
        log(`✅ [${i+1}/${junkFiles.length}] ${file} (${wordCount}w)`);
        success++;
        done = true;
      } catch (err) {
        if (err.message?.includes('429')) {
          const wait = 30 * (attempt + 1);
          log(`⏳ Rate limited, waiting ${wait}s... (${file})`);
          await new Promise(r => setTimeout(r, wait * 1000));
        } else {
          log(`❌ [${i+1}/${junkFiles.length}] ${file}: ${err.message.substring(0, 80)}`);
          failed++;
          done = true;
        }
      }
    }
    
    // 10s delay between articles
    if (i < junkFiles.length - 1) {
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  
  log(`\nCOMPLETE: ✅ ${success} fixed, ❌ ${failed} failed out of ${junkFiles.length}`);
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
