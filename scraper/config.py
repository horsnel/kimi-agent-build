"""
Shared configuration and helper utilities for Sigma Capital scrapers.
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
STOCKS_DIR = DATA_DIR / "stocks"

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STOCKS_DIR, exist_ok=True)

# ── Rate Limiting ────────────────────────────────────────────────────────────
RATE_LIMIT_DELAY = 0.5  # seconds between requests

# ── User-Agent ───────────────────────────────────────────────────────────────
USER_AGENT = (
    "SigmaCapital/1.0 (contact@sigmacapital.io) "
    "Financial data aggregation for research purposes"
)

# ── Helpers ──────────────────────────────────────────────────────────────────


def is_market_hours() -> bool:
    """Return True if current time is Mon-Fri 9:30-16:00 Eastern Time."""
    from zoneinfo import ZoneInfo

    et = ZoneInfo("US/Eastern")
    now = datetime.now(et)
    # Monday=0 … Sunday=6
    if now.weekday() >= 5:
        return False
    market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return market_open <= now <= market_close


def save_json(filename: str, data) -> None:
    """Save *data* as pretty-printed JSON to DATA_DIR/filename."""
    filepath = DATA_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"  ✓ Saved {filepath.relative_to(REPO_ROOT)} ({_size(filepath)})")


def _size(p: Path) -> str:
    """Human-readable file size."""
    s = p.stat().st_size
    for unit in ("B", "KB", "MB"):
        if s < 1024:
            return f"{s:.1f} {unit}"
        s /= 1024
    return f"{s:.1f} GB"


def safe_get(url: str, headers: dict | None = None, timeout: int = 15):
    """Make a GET request with error handling. Returns response or None."""
    import requests as _req

    default_headers = {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": "gzip, deflate",
        "Accept": "application/json, text/html, */*",
    }
    if headers:
        default_headers.update(headers)
    try:
        resp = _req.get(url, headers=default_headers, timeout=timeout)
        resp.raise_for_status()
        return resp
    except Exception as exc:
        print(f"  ✗ GET {url} failed: {exc}")
        return None


def rate_limit() -> None:
    """Sleep for RATE_LIMIT_DELAY seconds."""
    time.sleep(RATE_LIMIT_DELAY)


def utc_now_iso() -> str:
    """Current UTC time in ISO-8601 format."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_float(value, default=None):
    """Convert value to float, return default on failure."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def safe_int(value, default=None):
    """Convert value to int, return default on failure."""
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
