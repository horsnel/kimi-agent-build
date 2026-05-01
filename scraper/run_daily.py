"""
Daily scraper — comprehensive data refresh.
Runs: SEC filings, earnings, economic calendar, stock screener,
      commodity correlations, currency strength, full stock analysis
Uses proxy rotation for all requests.
"""

import sys
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import save_json, utc_now_iso, get_proxy_manager


def run_scraper(name: str, module_name: str) -> dict:
    start = time.time()
    try:
        module = __import__(module_name)
        module.main()
        duration = round(time.time() - start, 1)
        return {"status": "success", "timestamp": utc_now_iso(), "duration": f"{duration}s"}
    except Exception as exc:
        duration = round(time.time() - start, 1)
        traceback.print_exc()
        return {"status": "error", "timestamp": utc_now_iso(), "duration": f"{duration}s", "error": str(exc)}


def main():
    print("=" * 60)
    print("  SIGMA CAPITAL — DAILY SCRAPER")
    print("=" * 60)

    # Initialize proxy manager
    pm = get_proxy_manager()
    print(f"  Proxy mode: {'Paid service' if pm.is_paid_proxy else 'Free pool / direct'}")

    scrapers = [
        ("Stocks (full)", "stocks"),
        ("SEC Filings", "sec"),
        ("Earnings", "earnings"),
        ("Economic", "economic"),
        ("Commodities", "commodities"),
        ("News", "news"),
    ]

    results = {}
    for display_name, module_name in scrapers:
        print(f"\n{'─' * 40}")
        print(f"  ▶ Running: {display_name}")
        print(f"{'─' * 40}")
        results[module_name] = run_scraper(display_name, module_name)

    manifest = {
        "lastUpdated": utc_now_iso(),
        "scrapers": results,
        "status": "success" if all(r["status"] == "success" for r in results.values()) else "partial",
        "runType": "daily",
        "proxyMode": "paid" if pm.is_paid_proxy else "free",
    }
    save_json("manifest.json", manifest)

    print(f"\n{'=' * 60}")
    print("  SUMMARY")
    print(f"{'=' * 60}")
    for name, result in results.items():
        icon = "✅" if result["status"] == "success" else "❌"
        print(f"  {icon} {name}: {result['status']} ({result['duration']})")


if __name__ == "__main__":
    main()
