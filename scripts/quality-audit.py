import json, os, re

articles_dir = "public/data/articles"
files = [f for f in os.listdir(articles_dir) if f.endswith('.json') and f != 'index.json']

junk = []
good = []

for f in files:
    path = os.path.join(articles_dir, f)
    art = json.load(open(path))
    content = art.get('content', {})
    
    if not isinstance(content, dict):
        junk.append((f, 'non-dict', 0))
        continue
    
    # Get body text specifically
    body = content.get('body', [])
    items_list = content.get('items', [])
    
    # Combine all text from content
    all_text_parts = []
    for key, val in content.items():
        if isinstance(val, str):
            all_text_parts.append(val)
        elif isinstance(val, list):
            for item in val:
                if isinstance(item, str):
                    all_text_parts.append(item)
                elif isinstance(item, dict):
                    for v in item.values():
                        if isinstance(v, str):
                            all_text_parts.append(v)
    
    all_text = ' '.join(all_text_parts)
    
    # Quality checks
    problems = 0
    
    # 1. Very short overall content
    if len(all_text) < 500:
        problems += 3
    
    # 2. Many ### or #### headings = likely scraped with navigation
    h3_count = len(re.findall(r'^#{3,4}\s', all_text, re.MULTILINE))
    if h3_count > 5:
        problems += 2
    
    # 3. "Table of Contents" = scraped junk
    if 'Table of Contents' in all_text:
        problems += 2
    
    # 4. Navigation/link fragments
    if re.search(r'\]\(/about/plans|IBD Digital|Start Here|Morningstar|Read more', all_text, re.IGNORECASE):
        problems += 2
    
    # 5. Many short body items (fragments)
    if isinstance(body, list):
        short_items = sum(1 for b in body if isinstance(b, str) and len(b) < 80)
        if short_items > 3 and len(body) > 3:
            problems += 2
    
    # 6. Garbage characters
    if re.search(r'\+\s*\.\s*\*\s*\.\s*\+', all_text):
        problems += 2
    
    # 7. Too many #### headings relative to content length (scraped lists)
    if h3_count > 3 and len(all_text) / max(h3_count, 1) < 200:
        problems += 1
    
    if problems >= 3:
        junk.append((f, f'problems={problems}', len(all_text)))
    else:
        good.append(f)

print(f"GOOD: {len(good)}")
print(f"JUNK (needs rewrite): {len(junk)}")

# Save junk list for the cleaning script
junk_files = [item[0] for item in junk]
with open('/tmp/junk-articles.json', 'w') as fh:
    json.dump(junk_files, fh)

print(f"\nSaved {len(junk_files)} junk files to /tmp/junk-articles.json")
print("\n--- JUNK ARTICLES (grouped by problem severity) ---")
severe = [j for j in junk if 'problems=4' in j[1] or 'problems=5' in j[1] or 'problems=6' in j[1] or 'problems=7' in j[1]]
moderate = [j for j in junk if 'problems=3' in j[1]]
print(f"  Severe (4+ problems): {len(severe)}")
print(f"  Moderate (3 problems): {len(moderate)}")
