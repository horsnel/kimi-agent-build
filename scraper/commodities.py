"""
Commodity and currency data scraper for Sigma Capital.

Scrapes:
  - Commodity prices (Gold, Silver, Oil, Nat Gas, Copper, Wheat, Corn, Soybeans)
  - Commodity correlation matrix (6-month pairwise Pearson)
  - Currency strength scores (7 FX pairs + USD)

Uses proxy-enabled yfinance sessions via get_yf_ticker().
"""

from config import (
    DATA_DIR,
    get_yf_ticker,
    rate_limit,
    safe_float,
    safe_int,
    safe_get,
    save_json,
    utc_now_iso,
)


# ── Commodity Prices ─────────────────────────────────────────────────────────

COMMODITIES = {
    "GC=F": "Gold", "SI=F": "Silver", "CL=F": "Oil", "NG=F": "Nat Gas",
    "HG=F": "Copper", "ZW=F": "Wheat", "ZC=F": "Corn", "ZS=F": "Soybeans",
}


def scrape_commodity_prices() -> dict:
    """Get current commodity prices and changes with proxy."""
    print("\n🏗️ Scraping commodity prices …")
    prices = []

    for ticker_symbol, name in COMMODITIES.items():
        try:
            ticker = get_yf_ticker(ticker_symbol)
            info = ticker.info

            price = safe_float(info.get("regularMarketPrice") or info.get("currentPrice"))
            prev_close = safe_float(info.get("regularMarketPreviousClose") or info.get("previousClose"))

            change = None
            change_pct = None
            if price is not None and prev_close is not None and prev_close != 0:
                change = round(price - prev_close, 2)
                change_pct = round(((price - prev_close) / prev_close) * 100, 2)

            prices.append({
                "name": name, "ticker": ticker_symbol,
                "price": price, "change": change, "changePercent": change_pct,
            })
            print(f"  ✓ {name}: ${price:,.2f} ({change_pct:+.2f}%)" if price and change_pct is not None else f"  ✓ {name}: data retrieved")

        except Exception as exc:
            print(f"  ✗ {name} failed: {exc}")

        rate_limit()

    result = {"prices": prices}
    save_json("commodities.json", result)
    return result


# ── Commodity Correlation ────────────────────────────────────────────────────

def pearson_correlation(x: list[float], y: list[float]) -> float:
    """Calculate Pearson correlation coefficient (pure Python)."""
    n = min(len(x), len(y))
    if n < 2:
        return 0
    mean_x = sum(x[:n]) / n
    mean_y = sum(y[:n]) / n
    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n)) / n
    std_x = (sum((x[i] - mean_x) ** 2 for i in range(n)) / n) ** 0.5
    std_y = (sum((y[i] - mean_y) ** 2 for i in range(n)) / n) ** 0.5
    if std_x == 0 or std_y == 0:
        return 0
    return round(cov / (std_x * std_y), 2)


def scrape_commodity_correlation() -> dict:
    """Calculate 6-month pairwise Pearson correlation for commodities with proxy."""
    print("\n🔗 Scraping commodity correlation …")

    price_series: dict[str, list[float]] = {}
    ticker_list = list(COMMODITIES.keys())
    name_list = list(COMMODITIES.values())

    for ticker_symbol in ticker_list:
        try:
            ticker = get_yf_ticker(ticker_symbol)
            hist = ticker.history(period="6mo")
            if not hist.empty:
                price_series[ticker_symbol] = [round(float(c), 4) for c in hist["Close"].tolist()]
                print(f"  ✓ {COMMODITIES[ticker_symbol]}: {len(price_series[ticker_symbol])} days")
            else:
                price_series[ticker_symbol] = []
                print(f"  ⚠ {COMMODITIES[ticker_symbol]}: no history data")
        except Exception as exc:
            price_series[ticker_symbol] = []
            print(f"  ✗ {COMMODITIES[ticker_symbol]} failed: {exc}")

        rate_limit()

    size = len(ticker_list)
    correlation_matrix = [[0.0] * size for _ in range(size)]

    for i in range(size):
        for j in range(size):
            if i == j:
                correlation_matrix[i][j] = 1.0
            elif price_series[ticker_list[i]] and price_series[ticker_list[j]]:
                correlation_matrix[i][j] = pearson_correlation(
                    price_series[ticker_list[i]], price_series[ticker_list[j]]
                )
            else:
                correlation_matrix[i][j] = 0.0

    result = {"commodities": name_list, "correlation": correlation_matrix}
    save_json("commodity_correlation.json", result)
    print(f"  ✓ Correlation matrix: {size}x{size}")
    return result


# ── Currency Strength ─────────────────────────────────────────────────────────

FX_TICKERS = {
    "EURUSD=X": "EUR", "GBPUSD=X": "GBP", "USDJPY=X": "JPY",
    "USDCHF=X": "CHF", "USDCAD=X": "CAD", "AUDUSD=X": "AUD",
    "NZDUSD=X": "NZD",
}


def _normalize_strength(pct_change: float) -> float:
    score = 50 + (pct_change / 3.0) * 50
    return max(0, min(100, round(score)))


def scrape_currency_strength() -> list[dict]:
    """Get currency strength scores based on 5-day performance with proxy."""
    print("\n💱 Scraping currency strength …")
    results = []
    currency_changes: dict[str, float] = {}

    for ticker_symbol, currency in FX_TICKERS.items():
        try:
            ticker = get_yf_ticker(ticker_symbol)
            hist = ticker.history(period="5d")

            if hist.empty or len(hist) < 2:
                print(f"  ⚠ {currency}: insufficient history")
                currency_changes[currency] = 0.0
                results.append({"currency": currency, "strength": 50, "change24h": 0.0})
                rate_limit()
                continue

            start_price = float(hist["Close"].iloc[0])
            end_price = float(hist["Close"].iloc[-1])

            is_usd_base = ticker_symbol.startswith("USD") and not ticker_symbol.startswith("USDU")

            if is_usd_base:
                pct_change = round(((start_price - end_price) / end_price) * 100, 2)
            else:
                pct_change = round(((end_price - start_price) / start_price) * 100, 2)

            currency_changes[currency] = pct_change
            strength = _normalize_strength(pct_change)

            change_24h = 0.0
            if len(hist) >= 2:
                last_price = float(hist["Close"].iloc[-1])
                prev_price = float(hist["Close"].iloc[-2])
                if is_usd_base:
                    change_24h = round(((prev_price - last_price) / last_price) * 100, 2)
                else:
                    change_24h = round(((last_price - prev_price) / prev_price) * 100, 2)

            results.append({"currency": currency, "strength": strength, "change24h": change_24h})
            print(f"  ✓ {currency}: strength={strength}, 24h={change_24h:+.2f}%")

        except Exception as exc:
            print(f"  ✗ {currency} failed: {exc}")
            currency_changes[currency] = 0.0

        rate_limit()

    basket_changes = [v for k, v in currency_changes.items()]
    if basket_changes:
        avg_non_usd = sum(basket_changes) / len(basket_changes)
        usd_pct_change = round(-avg_non_usd, 2)
    else:
        usd_pct_change = 0.0

    usd_strength = _normalize_strength(usd_pct_change)
    usd_change_24h = round(-sum(r.get("change24h", 0) for r in results) / max(len(results), 1), 2)

    results.insert(0, {"currency": "USD", "strength": usd_strength, "change24h": usd_change_24h})
    print(f"  ✓ USD: strength={usd_strength}, 24h={usd_change_24h:+.2f}%")

    save_json("currency_strength.json", results)
    return results


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    """Run all commodity and currency scraping functions."""
    print("=" * 60)
    print("  COMMODITIES SCRAPER — Sigma Capital")
    print("=" * 60)

    try:
        scrape_commodity_prices()
    except Exception as exc:
        print(f"  ✗ Commodity prices failed: {exc}")

    try:
        scrape_commodity_correlation()
    except Exception as exc:
        print(f"  ✗ Commodity correlation failed: {exc}")

    try:
        scrape_currency_strength()
    except Exception as exc:
        print(f"  ✗ Currency strength failed: {exc}")

    print("\n✅ Commodities scraper complete.")


if __name__ == "__main__":
    main()
