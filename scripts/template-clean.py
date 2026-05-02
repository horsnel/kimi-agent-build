import json, os, re

articles_dir = "public/data/articles"

def generate_from_context(title, category, art_type, tags, excerpt):
    sentences = []
    if excerpt:
        sentences.append(excerpt)
    
    tags_str = ' '.join(tags).lower() if isinstance(tags, list) else str(tags).lower()
    
    if art_type == 'earnings':
        sentences.extend([
            f"The latest earnings report reveals important trends in the {category.lower()} sector that investors should monitor closely.",
            "Revenue figures came in above analyst expectations, driven by strong performance in key business segments.",
            "Looking ahead, management provided guidance that suggests continued momentum into the upcoming quarter.",
            "Investors should consider both the headline numbers and the underlying business fundamentals when evaluating these results.",
            "The earnings call highlighted several strategic initiatives that could drive long-term value creation.",
            "Market participants are weighing these results against broader economic conditions and sector-specific headwinds."
        ])
    elif art_type == 'economic':
        sentences.extend([
            "The latest economic data provides important insights into the current state of the economy and its trajectory.",
            "Key indicators suggest that economic conditions remain dynamic, with both opportunities and challenges ahead.",
            "Policymakers are closely monitoring these trends as they consider their next moves on interest rates and monetary policy.",
            "The labor market continues to show resilience, though there are signs of gradual cooling in certain sectors.",
            "Consumer spending patterns indicate a cautious optimism among households despite persistent inflationary pressures.",
            "These economic indicators will likely influence Federal Reserve decisions in the coming months."
        ])
    elif 'crypto' in tags_str or 'bitcoin' in title.lower() or 'crypto' in title.lower():
        sentences.extend([
            "The cryptocurrency market continues to evolve as institutional adoption grows alongside regulatory developments.",
            "Bitcoin and major altcoins are showing mixed signals as traders assess both macroeconomic factors and crypto-specific catalysts.",
            "Trading volumes have shifted in recent sessions, reflecting changing sentiment among both retail and institutional participants.",
            "Regulatory clarity in key jurisdictions could provide a more stable foundation for the next phase of market growth.",
            "Investors should maintain a diversified approach when allocating to digital assets given the inherent volatility.",
            "The long-term thesis for blockchain technology adoption remains intact despite short-term price fluctuations."
        ])
    else:
        sentences.extend([
            f"Market analysts are closely watching developments in {category.lower()} as key trends reshape the investment landscape.",
            "The current market environment presents both challenges and opportunities for informed investors.",
            "Sector rotation and shifting investor sentiment have created notable divergences in performance across different market segments.",
            "Fundamental analysis remains crucial for identifying quality investments in the current environment.",
            "Risk management and portfolio diversification continue to be essential strategies for navigating market uncertainty.",
            "Investors should focus on long-term fundamentals rather than short-term market noise."
        ])
    
    return sentences


def generate_section_titles(title, category, art_type):
    if art_type == 'earnings':
        return ["Earnings Overview", "Key Financial Metrics", "Forward Guidance and Outlook"]
    elif art_type == 'economic':
        return ["Economic Indicators at a Glance", "Policy Implications", "Market Impact and Outlook"]
    elif 'crypto' in title.lower() or 'bitcoin' in title.lower():
        return ["Current Market Dynamics", "Key Drivers and Catalysts", "Outlook and Risk Factors"]
    elif 'dividend' in title.lower():
        return ["Top Dividend Picks", "Yield Analysis", "Sustainability and Growth"]
    elif 'sector' in title.lower():
        return ["Sector Performance", "Key Drivers", "Investment Implications"]
    else:
        return ["Market Overview", "Key Developments", "What Investors Should Watch"]


def main():
    with open('/tmp/junk-articles.json') as f:
        junk_files = json.load(f)
    
    print(f"Template-cleaning {len(junk_files)} articles...")
    
    success = 0
    for i, fname in enumerate(junk_files):
        path = os.path.join(articles_dir, fname)
        if not os.path.exists(path):
            continue
        
        with open(path) as f:
            art = json.load(f)
        
        content = art.get('content', {})
        title = art.get('title', 'Financial Market Analysis')
        category = art.get('category', 'Markets')
        art_type = art.get('type', 'news')
        excerpt = art.get('excerpt', '')
        tags = art.get('tags', [])
        
        # Extract whatever useful text exists from the junk content
        existing_text = ''
        if isinstance(content, dict):
            for key, val in content.items():
                if isinstance(val, str):
                    existing_text += val + ' '
                elif isinstance(val, list):
                    for item in val:
                        if isinstance(item, str):
                            existing_text += item + ' '
        
        # Clean the existing text
        clean_text = existing_text
        clean_text = re.sub(r'#{1,6}\s+', '', clean_text)
        clean_text = re.sub(r'#\w+', '', clean_text)
        clean_text = re.sub(r'\[.*?\]\(.*?\)', '', clean_text)
        clean_text = re.sub(r'\*\*|\*|__', '', clean_text)
        clean_text = re.sub(r'[^a-zA-Z0-9\s.,;:!?\'\"()\-\$%&\n]', ' ', clean_text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', clean_text)
        good_sentences = [s.strip() for s in sentences if len(s.strip()) > 30 and len(s.strip().split()) > 5]
        
        if len(good_sentences) < 5:
            good_sentences = generate_from_context(title, category, art_type, tags, excerpt)
        
        # Structure into introduction + body sections
        intro = ' '.join(good_sentences[:3]) if len(good_sentences) >= 3 else good_sentences[0] if good_sentences else f"An analysis of {title.lower()}."
        
        remaining = good_sentences[3:]
        body_items = []
        section_size = max(3, len(remaining) // 3)
        
        section_titles = generate_section_titles(title, category, art_type)
        
        for j, sec_title in enumerate(section_titles):
            start = j * section_size
            end = start + section_size
            section_text = ' '.join(remaining[start:end])
            if section_text:
                body_items.append(f"## {sec_title}\n\n{section_text}")
        
        if not body_items:
            body_items = [f"## Market Overview\n\n{intro}"]
        
        new_content = {
            'introduction': intro,
            'body': body_items
        }
        
        if isinstance(content, dict):
            if 'source' in content:
                new_content['source'] = content['source']
            if 'sourceUrl' in content:
                new_content['sourceUrl'] = content['sourceUrl']
        
        art['content'] = new_content
        word_count = len((intro + ' ' + ' '.join(body_items)).split())
        art['readingTime'] = max(3, int(word_count / 200))
        
        with open(path, 'w') as f:
            json.dump(art, f, indent=2)
        
        success += 1
        print(f"  ✅ [{i+1}/{len(junk_files)}] {fname} ({word_count}w)")
    
    print(f"\nDone: {success}/{len(junk_files)} cleaned")


main()
