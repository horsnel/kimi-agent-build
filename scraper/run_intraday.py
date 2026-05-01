"""
Intraday scraper — quick market-hours data only.
Runs: market indices, crypto overview, fear & greed (fast sources only)
Skips: SEC filings, earnings, economic calendar, commodity correlations
Uses proxy rotation for all requests.
"""

import sys
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import save_json, utc_now_iso, get_proxy_manager


def run_scraper(name: str, fn) -> dict:
    start = time.time()
    try:
        fn()
        duration = round(time.time() - start, 1)
        return {"status": "success", "timestamp": utc_now_iso(), "duration": f"{duration}s"}
    except Exception as exc:
        duration = round(time.time() - start, 1)
        traceback.print_exc()
        return {"status": "error", "timestamp": utc_now_iso(), "duration": f"{duration}s", "error": str(exc)}


def main():
    print("=" * 60)
    print("  SIGMA CAPITAL — INTRADAY SCRAPER")
    print("=" * 60)

    # Initialize proxy manager
    pm = get_proxy_manager()
    print(f"  Proxy mode: {'Paid service' if pm.is_paid_proxy else 'Free pool / direct'}")

    from stocks import scrape_market_indices
    from crypto import scrape_crypto_overview
    from fear_greed import scrape_fear_greed, scrape_crypto_fear_greed

    results = {}
    results["indices"] = run_scraper("Market Indices", scrape_market_indices)
    results["crypto"] = run_scraper("Crypto", scrape_crypto_overview)
    results["fear_greed"] = run_scraper("Fear & Greed", scrape_fear_greed)
    results["crypto_fear_greed"] = run_scraper("Crypto Fear & Greed", scrape_crypto_fear_greed)

    # Update manifest
    manifest = {
        "lastUpdated": utc_now_iso(),
        "scrapers": results,
        "status": "success" if all(r["status"] == "success" for r in results.values()) else "partial",
        "runType": "intraday",
        "proxyMode": "paid" if pm.is_paid_proxy else "free",
    }
    save_json("manifest.json", manifest)

    print(f"\n{'=' * 60}")
    for name, result in results.items():
        icon = "✅" if result["status"] == "success" else "❌"
        print(f"  {icon} {name}: {result['status']} ({result['duration']})")


if __name__ == "__main__":
    main()
