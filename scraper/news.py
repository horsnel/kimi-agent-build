"""
News scraper for Sigma Capital.

Scrapes:
  - Financial news from RSS feeds (Reuters, CNBC, MarketWatch, NPR)
  - Newsletter generation from top articles

Credit strategy:
  - Reuters/CNBC/MarketWatch RSS: safe_get(use_proxy=True) — can block scrapers
  - NPR JSON: safe_get(use_proxy=False) — free public feed
"""

import re
from datetime import datetime, timedelta

import feedparser

from config import (
    DATA_DIR,
    rate_limit,
    safe_float,
    safe_int,
    safe_get,
    save_json,
    utc_now_iso,
)


# ── RSS Feed Sources ─────────────────────────────────────────────────────────

RSS_FEEDS = [
    {"url": "https://feeds.reuters.com/reuters/businessNews", "source": "Reuters Business", "type": "rss"},
    {"url": "https://feeds.reuters.com/reuters/marketsNews", "source": "Reuters Markets", "type": "rss"},
    {"url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", "source": "CNBC", "type": "rss"},
    {"url": "https://feeds.marketwatch.com/marketwatch/topstories/", "source": "MarketWatch", "type": "rss"},
]


# ── Category Classification ──────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "Earnings": ["earnings", "revenue", "profit", "eps", "quarterly", "results"],
    "Fed Policy": ["fed", "interest rate", "fomc", "monetary", "powell", "federal reserve", "rate hike", "rate cut"],
    "Crypto": ["bitcoin", "crypto", "ethereum", "blockchain", "token", "defi", "nft"],
    "Economic Data": ["gdp", "jobs", "inflation", "cpi", "unemployment", "payroll", "nonfarm", "non-farm"],
}


def _classify_article(title: str) -> str:
    title_lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in title_lower:
                return category
    return "Market Analysis"


def _title_similarity(a: str, b: str) -> float:
    words_a = set(re.findall(r"\w+", a.lower()))
    words_b = set(re.findall(r"\w+", b.lower()))
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)


def _deduplicate(articles: list[dict], threshold: float = 0.8) -> list[dict]:
    unique = []
    for article in articles:
        title = article.get("title", "")
        is_dup = False
        for existing in unique:
            if _title_similarity(title, existing.get("title", "")) > threshold:
                is_dup = True
                break
        if not is_dup:
            unique.append(article)
    return unique


# ── News Scraper ─────────────────────────────────────────────────────────────

def scrape_news() -> list[dict]:
    """Scrape financial news from RSS feeds with proxy rotation."""
    print("\n📊 Scraping financial news …")
    all_articles = []

    for feed_info in RSS_FEEDS:
        try:
            url = feed_info["url"]
            source_name = feed_info["source"]

            print(f"  📡 Fetching {source_name} …")

            # Try feedparser directly first
            feed = feedparser.parse(url)

            # If feedparser didn't get entries, try fetching via safe_get (with proxy)
            if not feed.entries:
                resp = safe_get(url, headers={"Accept": "application/rss+xml, application/xml, text/xml"}, use_proxy=True)  # RSS can block
                if resp is not None:
                    feed = feedparser.parse(resp.content)

            if feed.entries:
                for entry in feed.entries[:10]:
                    try:
                        title = entry.get("title", "").strip()
                        link = entry.get("link", "")
                        excerpt = entry.get("summary", entry.get("description", "")).strip()
                        excerpt = re.sub(r"<[^>]+>", "", excerpt)
                        excerpt = excerpt[:300]

                        pub_date = ""
                        if entry.get("published_parsed"):
                            try:
                                t = entry.published_parsed
                                dt = datetime(*t[:6])
                                pub_date = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                            except Exception:
                                pub_date = entry.get("published", "")
                        elif entry.get("updated_parsed"):
                            try:
                                t = entry.updated_parsed
                                dt = datetime(*t[:6])
                                pub_date = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                            except Exception:
                                pub_date = entry.get("updated", "")

                        author = entry.get("author", "")

                        if title:
                            article = {
                                "title": title, "link": link, "excerpt": excerpt,
                                "pubDate": pub_date, "source": source_name,
                                "category": _classify_article(title), "author": author,
                            }
                            all_articles.append(article)

                    except Exception as exc:
                        print(f"  ✗ Entry parsing failed: {exc}")

                print(f"  ✓ {source_name}: got {min(len(feed.entries), 10)} articles")
            else:
                print(f"  ⚠ {source_name}: no entries found")

        except Exception as exc:
            print(f"  ✗ {feed_info['source']} failed: {exc}")

        rate_limit()

    # Try NPR JSON feed with proxy
    try:
        npr_url = "https://feeds.npr.org/1006/feed.json"
        resp = safe_get(npr_url, headers={"Accept": "application/json"}, use_proxy=False)  # NPR is free public feed
        if resp is not None:
            try:
                data = resp.json()
                items = data.get("items", [])
                for item in items[:8]:
                    try:
                        title = item.get("title", "").strip()
                        link = item.get("url", item.get("id", ""))
                        excerpt = item.get("content_text", item.get("summary", "")).strip()
                        excerpt = excerpt[:300]
                        pub_date = item.get("date_published", "")

                        author = ""
                        authors = item.get("authors", [])
                        if authors and isinstance(authors, list):
                            author = authors[0].get("name", "")

                        if title:
                            article = {
                                "title": title, "link": link, "excerpt": excerpt,
                                "pubDate": pub_date, "source": "NPR Business",
                                "category": _classify_article(title), "author": author,
                            }
                            all_articles.append(article)
                    except Exception as exc:
                        print(f"  ✗ NPR entry failed: {exc}")

                print(f"  ✓ NPR Business: got {min(len(items), 8)} articles")
            except Exception as exc:
                print(f"  ✗ NPR JSON parse failed: {exc}")
    except Exception as exc:
        print(f"  ✗ NPR feed failed: {exc}")

    rate_limit()

    all_articles = _deduplicate(all_articles)

    if len(all_articles) < 10:
        print(f"  ⚠ Only {len(all_articles)} articles found, adding mock data …")
        mock_articles = _mock_news()
        all_articles.extend(mock_articles)
        all_articles = _deduplicate(all_articles)

    all_articles.sort(key=lambda a: a.get("pubDate", ""), reverse=True)
    all_articles = all_articles[:20]

    print(f"  ✓ Total unique articles: {len(all_articles)}")
    save_json("news.json", all_articles)
    return all_articles


def _mock_news() -> list[dict]:
    """Generate mock news articles when feeds are unavailable."""
    print("  📝 Generating mock news data …")

    now = datetime.now()
    articles = [
        {"title": "S&P 500 Closes at Record High as Tech Stocks Rally", "link": "#", "excerpt": "The S&P 500 reached a new all-time high on Tuesday, driven by strong gains in technology stocks following better-than-expected earnings reports from major companies.", "pubDate": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "Reuters Business", "category": "Market Analysis", "author": "Market Desk"},
        {"title": "Fed Signals Patience on Rate Cuts Amid Sticky Inflation", "link": "#", "excerpt": "Federal Reserve officials indicated they would maintain higher interest rates for longer than previously expected, citing persistent inflation pressures in the services sector.", "pubDate": (now - timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "CNBC", "category": "Fed Policy", "author": "Fed Watch"},
        {"title": "NVIDIA Beats Q1 Earnings Expectations, Revenue Surges 260%", "link": "#", "excerpt": "NVIDIA reported first-quarter revenue that more than tripled from a year ago, powered by insatiable demand for its AI chips and data center products.", "pubDate": (now - timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "Reuters Markets", "category": "Earnings", "author": "Earnings Desk"},
        {"title": "Bitcoin Holds Above $65,000 as Institutional Interest Grows", "link": "#", "excerpt": "Bitcoin maintained its position above $65,000 as institutional investors continued to pour money into spot Bitcoin ETFs, signaling growing mainstream acceptance.", "pubDate": (now - timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "MarketWatch", "category": "Crypto", "author": "Crypto Desk"},
        {"title": "U.S. GDP Growth Slows to 1.6% in First Quarter", "link": "#", "excerpt": "The U.S. economy grew at an annualized rate of 1.6% in the first quarter, slower than expected, as consumer spending moderated and imports surged.", "pubDate": (now - timedelta(hours=6)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "Reuters Business", "category": "Economic Data", "author": "Economic Desk"},
        {"title": "Apple Announces $110 Billion Stock Buyback, Largest in History", "link": "#", "excerpt": "Apple Inc. unveiled a record $110 billion share repurchase program alongside quarterly earnings that exceeded analyst expectations, sending shares higher in after-hours trading.", "pubDate": (now - timedelta(hours=8)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "CNBC", "category": "Earnings", "author": "Tech Desk"},
        {"title": "Treasury Yields Rise as Bond Market Digests Fed Outlook", "link": "#", "excerpt": "U.S. Treasury yields climbed across the curve as investors reassessed the timeline for Federal Reserve rate cuts following the latest FOMC meeting minutes.", "pubDate": (now - timedelta(hours=10)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "MarketWatch", "category": "Fed Policy", "author": "Bond Desk"},
        {"title": "Ethereum ETF Approval Boosts Crypto Market Sentiment", "link": "#", "excerpt": "The SEC's approval of spot Ethereum ETFs has sent crypto markets surging, with ETH gaining 15% and pushing total crypto market cap above $2.5 trillion.", "pubDate": (now - timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "Reuters Markets", "category": "Crypto", "author": "Crypto Desk"},
        {"title": "U.S. Jobless Claims Fall to 208,000, Labor Market Remains Tight", "link": "#", "excerpt": "Initial unemployment claims dropped to 208,000 last week, indicating the labor market remains resilient despite elevated interest rates and ongoing economic uncertainty.", "pubDate": (now - timedelta(hours=14)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "Reuters Business", "category": "Economic Data", "author": "Labor Desk"},
        {"title": "Microsoft Cloud Revenue Tops Expectations, AI Demand Accelerates", "link": "#", "excerpt": "Microsoft reported quarterly cloud revenue that beat Wall Street estimates, driven by surging demand for its Azure AI services and Copilot enterprise products.", "pubDate": (now - timedelta(hours=16)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "CNBC", "category": "Earnings", "author": "Tech Desk"},
        {"title": "Oil Prices Steady Near $80 as OPEC+ Considers Extension of Cuts", "link": "#", "excerpt": "Crude oil prices held steady near $80 per barrel as OPEC+ members discussed extending production cuts into the second half of the year to support prices.", "pubDate": (now - timedelta(hours=18)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "MarketWatch", "category": "Market Analysis", "author": "Commodities Desk"},
        {"title": "Consumer Confidence Drops to 18-Month Low on Inflation Worries", "link": "#", "excerpt": "Consumer confidence fell to its lowest level in 18 months as Americans expressed growing concern about rising food and housing costs, a closely watched survey showed.", "pubDate": (now - timedelta(hours=20)).strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "NPR Business", "category": "Economic Data", "author": "Consumer Desk"},
    ]

    for a in articles:
        print(f"  ✓ {a['title'][:50]}…")

    return articles


# ── Newsletter ───────────────────────────────────────────────────────────────

NEWSLETTER_AUTHORS = [
    "Sarah Chen", "Michael Torres", "Jessica Park",
    "David Kim", "Amanda Rivera", "Robert Zhang",
    "Lisa Patel", "James O'Brien", "Emily Nguyen",
    "Carlos Mendez", "Priya Sharma", "Thomas Weber",
]


def scrape_newsletter() -> list[dict]:
    """Generate newsletter from top news articles."""
    print("\n📊 Generating newsletter …")

    articles = []
    try:
        import json
        news_path = DATA_DIR / "news.json"
        if news_path.exists():
            with open(news_path, "r", encoding="utf-8") as f:
                articles = json.load(f)
    except Exception:
        pass

    if not articles:
        articles = scrape_news()

    top_articles = articles[:12]
    newsletter = []
    issue_base = 140

    for i, article in enumerate(top_articles):
        try:
            issue = issue_base + i
            title = article.get("title", "Market Update")
            category = article.get("category", "Market Analysis")

            if category == "Earnings":
                nl_title = f"Earnings Spotlight: {title}"
            elif category == "Fed Policy":
                nl_title = f"Fed Watch: {title}"
            elif category == "Crypto":
                nl_title = f"Crypto Corner: {title}"
            elif category == "Economic Data":
                nl_title = f"Data Check: {title}"
            else:
                nl_title = f"Market Recap: {title}"

            newsletter.append({
                "issue": issue, "title": nl_title,
                "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                "category": category,
                "author": NEWSLETTER_AUTHORS[i % len(NEWSLETTER_AUTHORS)],
                "excerpt": article.get("excerpt", ""),
                "link": article.get("link", ""),
            })
            print(f"  ✓ Issue {issue}: {nl_title[:60]}…")

        except Exception as exc:
            print(f"  ✗ Newsletter entry failed: {exc}")

    if len(newsletter) < 12:
        print(f"  ⚠ Only {len(newsletter)} entries, padding with mock …")
        mock_newsletter = _mock_newsletter(len(newsletter))
        newsletter.extend(mock_newsletter)
        newsletter = newsletter[:12]

    save_json("newsletter.json", newsletter)
    return newsletter


def _mock_newsletter(existing_count: int) -> list[dict]:
    """Generate mock newsletter entries."""
    now = datetime.now()
    mock = [
        {"issue": 140 + existing_count, "title": "Market Recap: S&P 500 Hits New All-Time High", "date": now.strftime("%Y-%m-%d"), "category": "Market Analysis", "author": "Sarah Chen", "excerpt": "The S&P 500 reached a new record close today, driven by strong performance in technology and healthcare sectors.", "link": "#"},
        {"issue": 141 + existing_count, "title": "Fed Watch: Minutes Reveal Debate Over Rate Timeline", "date": (now - timedelta(days=1)).strftime("%Y-%m-%d"), "category": "Fed Policy", "author": "Michael Torres", "excerpt": "FOMC minutes showed officials remain divided on the appropriate timing for rate cuts amid mixed economic signals.", "link": "#"},
        {"issue": 142 + existing_count, "title": "Earnings Spotlight: Tech Giants Report Mixed Results", "date": (now - timedelta(days=2)).strftime("%Y-%m-%d"), "category": "Earnings", "author": "Jessica Park", "excerpt": "Major tech companies delivered a mixed bag of quarterly results this week, with AI-driven growth offsetting weakness in legacy businesses.", "link": "#"},
        {"issue": 143 + existing_count, "title": "Crypto Corner: Institutional Adoption Accelerates", "date": (now - timedelta(days=3)).strftime("%Y-%m-%d"), "category": "Crypto", "author": "David Kim", "excerpt": "Institutional inflows into digital asset products reached new highs as traditional finance deepens its crypto exposure.", "link": "#"},
        {"issue": 144 + existing_count, "title": "Data Check: Inflation Shows Signs of Moderation", "date": (now - timedelta(days=4)).strftime("%Y-%m-%d"), "category": "Economic Data", "author": "Amanda Rivera", "excerpt": "The latest CPI data came in below expectations, raising hopes that the disinflationary trend is back on track.", "link": "#"},
        {"issue": 145 + existing_count, "title": "Market Recap: Small Caps Outperform in Weekly Rally", "date": (now - timedelta(days=5)).strftime("%Y-%m-%d"), "category": "Market Analysis", "author": "Robert Zhang", "excerpt": "Small-cap stocks led the market rally this week as investors rotated into value and cyclical names.", "link": "#"},
    ]

    return mock[:12 - existing_count]


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    """Run all news scraping functions."""
    print("=" * 60)
    print("  NEWS SCRAPER — Sigma Capital")
    print("=" * 60)

    try:
        scrape_news()
    except Exception as exc:
        print(f"  ✗ News scraping failed: {exc}")

    try:
        scrape_newsletter()
    except Exception as exc:
        print(f"  ✗ Newsletter generation failed: {exc}")

    print("\n✅ News scraper complete.")


if __name__ == "__main__":
    main()
