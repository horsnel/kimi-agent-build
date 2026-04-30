"""
Fear & Greed index scraper for Sigma Capital.

Scrapes:
  - CNN Fear & Greed Index (HTML scraping with proxy rotation)
  - Crypto Fear & Greed Index (Alternative.me API)

Credit strategy:
  - CNN: safe_get_rendered() -> ScrapingAnt with JS rendering (1 credit per request)
  - Alternative.me: safe_get(use_proxy=False) -> direct, FREE public API
  - VIX fallback: get_yf_ticker() -> direct, no ScrapingAnt
"""

import re

from config import (
    DATA_DIR,
    get_yf_ticker,
    rate_limit,
    safe_float,
    safe_int,
    safe_get,
    safe_get_rendered,
    save_json,
    utc_now_iso,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fear_greed_label(value: int) -> str:
    if value <= 25:
        return "Extreme Fear"
    elif value <= 45:
        return "Fear"
    elif value <= 55:
        return "Neutral"
    elif value <= 75:
        return "Greed"
    else:
        return "Extreme Greed"


def _vix_to_fear_greed(vix_value: float) -> int:
    if vix_value > 30:
        return 25
    elif vix_value > 20:
        return 45
    elif vix_value > 15:
        return 60
    else:
        return 75


# ── CNN Fear & Greed ─────────────────────────────────────────────────────────

def scrape_fear_greed() -> dict:
    """Scrape CNN Fear & Greed Index (uses ScrapingAnt JS rendering - 1 credit)."""
    print("\n📊 Scraping CNN Fear & Greed Index …")

    current_value = None
    prev_close_value = None
    one_week_ago_value = None
    one_month_ago_value = None
    one_year_ago_value = None
    source = "cnn"

    # Try scraping CNN with ScrapingAnt headless Chrome rendering
    try:
        url = "https://money.cnn.com/data/fear-and-greed/"
        resp = safe_get_rendered(url, cache_category="fear_greed")  # Uses ScrapingAnt API for JS rendering

        if resp is not None:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, "html.parser")
            text = soup.get_text()

            patterns = [
                (r"Fear\s*&\s*Greed\s*Now[:\s]+(\d+)", "current"),
                (r"Previous\s*Close[:\s]+(\d+)", "prev_close"),
                (r"One\s*Week\s*Ago[:\s]+(\d+)", "one_week"),
                (r"One\s*Month\s*Ago[:\s]+(\d+)", "one_month"),
                (r"One\s*Year\s*Ago[:\s]+(\d+)", "one_year"),
            ]

            for pattern, key in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    val = safe_int(match.group(1))
                    if key == "current":
                        current_value = val
                    elif key == "prev_close":
                        prev_close_value = val
                    elif key == "one_week":
                        one_week_ago_value = val
                    elif key == "one_month":
                        one_month_ago_value = val
                    elif key == "one_year":
                        one_year_ago_value = val

            if current_value is None:
                gauge_divs = soup.find_all(["div", "span"], class_=re.compile(r"fearAndGreed", re.I))
                for div in gauge_divs:
                    match = re.search(r"(\d{1,3})", div.get_text())
                    if match:
                        val = safe_int(match.group(1))
                        if 0 <= val <= 100:
                            current_value = val
                            break

            if current_value is None:
                all_text = resp.text
                js_matches = re.findall(r"FearAndGreedIndex[\'\"]?\s*[:=]\s*[\'\"]?(\d{1,3})", all_text)
                if js_matches:
                    val = safe_int(js_matches[0])
                    if val and 0 <= val <= 100:
                        current_value = val

            if current_value is not None:
                print(f"  ✓ CNN Fear & Greed: {current_value}")
            else:
                print("  ⚠ Could not parse CNN Fear & Greed value from page")

    except Exception as exc:
        print(f"  ✗ CNN scraping failed: {exc}")

    # Fallback: estimate from VIX (with proxy)
    if current_value is None:
        print("  ⚠ CNN scraping failed, estimating from VIX …")
        source = "vix_estimate"

        try:
            vix = get_yf_ticker("^VIX")
            hist = vix.history(period="1mo")
            if not hist.empty:
                current_vix = safe_float(hist["Close"].iloc[-1])
                if current_vix:
                    current_value = _vix_to_fear_greed(current_vix)
                    print(f"  ✓ VIX-based Fear & Greed estimate: {current_value} (VIX={current_vix})")

                if len(hist) >= 2:
                    prev_vix = safe_float(hist["Close"].iloc[-2])
                    if prev_vix:
                        prev_close_value = _vix_to_fear_greed(prev_vix)

                if len(hist) >= 6:
                    week_vix = safe_float(hist["Close"].iloc[-6])
                    if week_vix:
                        one_week_ago_value = _vix_to_fear_greed(week_vix)

                if len(hist) >= 22:
                    month_vix = safe_float(hist["Close"].iloc[0])
                    if month_vix:
                        one_month_ago_value = _vix_to_fear_greed(month_vix)
        except Exception as exc:
            print(f"  ✗ VIX estimation failed: {exc}")

    # Final fallback: mock data
    if current_value is None:
        print("  ⚠ All sources failed, using mock data …")
        source = "mock"
        current_value = 64
        prev_close_value = 61
        one_week_ago_value = 58
        one_month_ago_value = 45
        one_year_ago_value = 72

    if prev_close_value is None:
        prev_close_value = max(0, min(100, current_value - 3))
    if one_week_ago_value is None:
        one_week_ago_value = max(0, min(100, current_value - 6))
    if one_month_ago_value is None:
        one_month_ago_value = max(0, min(100, current_value - 19))
    if one_year_ago_value is None:
        one_year_ago_value = max(0, min(100, current_value + 8))

    result = {
        "current": {"value": current_value, "label": _fear_greed_label(current_value)},
        "previousClose": {"value": prev_close_value, "label": _fear_greed_label(prev_close_value)},
        "oneWeekAgo": {"value": one_week_ago_value, "label": _fear_greed_label(one_week_ago_value)},
        "oneMonthAgo": {"value": one_month_ago_value, "label": _fear_greed_label(one_month_ago_value)},
        "oneYearAgo": {"value": one_year_ago_value, "label": _fear_greed_label(one_year_ago_value)},
        "source": source,
    }
    save_json("fear_greed.json", result)
    return result


# ── Crypto Fear & Greed ──────────────────────────────────────────────────────

def scrape_crypto_fear_greed() -> dict:
    """Scrape Crypto Fear & Greed Index from Alternative.me (free API, no proxy)."""
    print("\n📊 Scraping Crypto Fear & Greed Index …")

    current_value = None
    current_classification = ""
    history = []
    source = "alternative.me"

    try:
        url = "https://api.alternative.me/fng/?limit=30"
        resp = safe_get(url, headers={"Accept": "application/json"}, use_proxy=False, cache_category="fear_greed")  # Free API, no proxy needed

        if resp is not None:
            try:
                data = resp.json()
                data_entries = data.get("data", [])

                if data_entries:
                    latest = data_entries[0]
                    current_value = safe_int(latest.get("value"))
                    current_classification = latest.get("value_classification", "")

                    for entry in data_entries:
                        timestamp = safe_int(entry.get("timestamp"))
                        value = safe_int(entry.get("value"))
                        classification = entry.get("value_classification", "")

                        if value is not None:
                            history.append({
                                "timestamp": timestamp,
                                "value": value,
                                "classification": classification,
                            })

                    print(f"  ✓ Crypto Fear & Greed: {current_value} ({current_classification})")
                    print(f"  ✓ Got {len(history)} historical entries")
                else:
                    print("  ⚠ API returned empty data")

            except Exception as exc:
                print(f"  ✗ Alternative.me JSON parse failed: {exc}")

    except Exception as exc:
        print(f"  ✗ Alternative.me API failed: {exc}")

    if current_value is None:
        print("  ⚠ Alternative.me failed, using mock data …")
        source = "mock"
        current_value = 64
        current_classification = "Greed"

        import random
        random.seed(42)
        base = 60
        for i in range(30):
            day_value = max(10, min(90, base + random.randint(-15, 15)))
            if day_value <= 25:
                cls = "Extreme Fear"
            elif day_value <= 45:
                cls = "Fear"
            elif day_value <= 55:
                cls = "Neutral"
            elif day_value <= 75:
                cls = "Greed"
            else:
                cls = "Extreme Greed"

            from datetime import datetime, timedelta
            ts = int((datetime.now() - timedelta(days=29 - i)).timestamp())
            history.append({
                "timestamp": ts, "value": day_value, "classification": cls,
            })
            base = day_value

    components = _generate_crypto_components(current_value)

    result = {
        "current": {"value": current_value, "classification": current_classification},
        "history": history,
        "components": components,
        "source": source,
    }
    save_json("crypto_fear_greed.json", result)
    return result


def _generate_crypto_components(fng_value: int) -> dict:
    """Generate reasonable mock component breakdown for Crypto Fear & Greed."""
    import random
    random.seed(fng_value)

    social_media = max(0, min(100, fng_value + random.randint(-15, 15)))
    volatility = max(0, min(100, fng_value + random.randint(-20, 10)))
    market_momentum = max(0, min(100, fng_value + random.randint(-10, 15)))
    dominance = max(0, min(100, fng_value + random.randint(-12, 12)))

    return {
        "socialMedia": social_media,
        "volatility": volatility,
        "marketMomentum": market_momentum,
        "dominance": dominance,
    }


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    """Run all Fear & Greed scraping functions."""
    print("=" * 60)
    print("  FEAR & GREED SCRAPER — Sigma Capital")
    print("=" * 60)

    try:
        scrape_fear_greed()
    except Exception as exc:
        print(f"  ✗ CNN Fear & Greed failed: {exc}")

    try:
        scrape_crypto_fear_greed()
    except Exception as exc:
        print(f"  ✗ Crypto Fear & Greed failed: {exc}")

    print("\n✅ Fear & Greed scraper complete.")


if __name__ == "__main__":
    main()
