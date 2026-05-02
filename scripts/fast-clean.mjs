import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'data', 'articles');

const START = parseInt(process.argv[2] || '0');
const COUNT = parseInt(process.argv[3] || '5');

async function main() {
  const zai = await ZAI.create();
  
  // Load junk list
  const junkFiles = JSON.parse(fs.readFileSync('/tmp/junk-articles.json', 'utf8'));
  const batch = junkFiles.slice(START, START + COUNT);
  
  console.log(`Processing ${batch.length} articles (offset ${START}, total junk: ${junkFiles.length})`);
  
  let success = 0, failed = 0;
  
  for (const file of batch) {
    const artPath = path.join(ARTICLES_DIR, file);
    const article = JSON.parse(fs.readFileSync(artPath, 'utf8'));
    
    const title = article.title || 'Financial Article';
    const category = article.category || 'Markets';
    const tags = (article.tags || []).join(', ');
    const artType = article.type || 'news';
    const excerpt = article.excerpt || '';
    const metaDesc = article.metaDescription || '';
    
    // Determine the article format to preserve structure
    const content = article.content || {};
    const hasKeyTakeaways = 'keyTakeaways' in content;
    const hasOutlook = 'outlook' in content;
    const hasSource = 'source' in content;
    
    const prompt = `You are a professional financial writer for Sigma Capital, a premium finance platform.

REWRITE this article into clean, professional content. The original was web-scraped and contains navigation fragments, hashtags, duplicate content, and broken formatting.

TITLE: ${title}
CATEGORY: ${category}
TYPE: ${artType}
${excerpt ? `SUMMARY: ${excerpt}` : ''}
${metaDesc ? `DESCRIPTION: ${metaDesc}` : ''}
${tags ? `TOPICS: ${tags}` : ''}

RULES:
- Write 600-1000 words of clean, professional financial content
- Use proper paragraphs with 3-5 sentences each
- Use markdown ## for section headings
- Do NOT use social-media hashtags (#investing, #stocks, etc.)
- Do NOT include navigation elements, "Table of Contents", "Read more", "Subscribe", or any website UI text
- Do NOT repeat content or start paragraphs with the same words
- Structure: Introduction → 2-4 sections with ## headings → Conclusion/takeaway
- Include specific data points, analyst views, or market context where the title suggests it
- Professional investor tone, each paragraph must be substantive

Return ONLY valid JSON:
{"introduction":"2-3 sentence compelling intro","body":["## Section Heading\\n\\nFull paragraph with detailed analysis and specific data points...","## Next Section\\n\\nMore detailed content with examples and insights..."]}`;

    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      try {
        const result = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You write professional finance articles. Output only valid JSON. Use ## for headings, never social-media #hashtags. No website UI text.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        let text = result.choices[0]?.message?.content || '';
        text = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        
        const parsed = JSON.parse(text);
        if (!parsed.introduction || !Array.isArray(parsed.body)) throw new Error('Bad structure');
        
        // Validate - check for social hashtags (not ## headings)
        const checkText = parsed.introduction + ' ' + parsed.body.join(' ');
        const withoutHeadings = checkText.replace(/^#{1,6}\s/gm, '');
        const socialHashtags = (withoutHeadings.match(/#\w+/g) || []).length;
        if (socialHashtags > 3) throw new Error('Has social hashtags');
        
        // Check for nav elements
        if (/Table of Contents|Read more|Subscribe|Sign Up|Log In/i.test(checkText)) {
          throw new Error('Has navigation elements');
        }
        
        // Build new content preserving original structure fields
        const newContent = {
          introduction: parsed.introduction,
          body: parsed.body
        };
        
        // Preserve keyTakeaways, outlook, source etc if they existed
        if (hasKeyTakeaways && content.keyTakeaways) {
          newContent.keyTakeaways = content.keyTakeaways;
        }
        if (hasOutlook && content.outlook) {
          newContent.outlook = content.outlook;
        }
        if (hasSource && content.source) {
          newContent.source = content.source;
          newContent.sourceUrl = content.sourceUrl || '';
        }
        
        article.content = newContent;
        const wordCount = checkText.split(/\s+/).length;
        article.readingTime = Math.max(3, Math.ceil(wordCount / 200));
        
        fs.writeFileSync(artPath, JSON.stringify(article, null, 2));
        console.log(`  ✅ ${file} (${wordCount} words)`);
        success++;
        done = true;
      } catch (err) {
        if (err.message?.includes('429') && attempt < 2) {
          console.log(`  ⏳ Rate limited, waiting 20s... (${file})`);
          await new Promise(r => setTimeout(r, 20000));
        } else {
          console.log(`  ❌ ${file}: ${err.message.substring(0, 100)}`);
          failed++;
          done = true;
        }
      }
    }
    
    // Delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log(`\nBatch done: ✅ ${success} fixed, ❌ ${failed} failed`);
  console.log(`Progress: ${START + success + failed}/${junkFiles.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
