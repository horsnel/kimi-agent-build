"""
Shared configuration and helper utilities for Sigma Capital scrapers.

Features:
  - ProxyManager: rotating proxy pool with health checks
  - User-agent rotation (30+ realistic browser UAs)
  - safe_get() with proxy rotation, retries, and exponential backoff
  - yfinance session factory with proxy support
  - No API keys required — all sources are free/public
"""

import json
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
STOCKS_DIR = DATA_DIR / "stocks"

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STOCKS_DIR, exist_ok=True)

# ── Rate Limiting ────────────────────────────────────────────────────────────
RATE_LIMIT_DELAY = float(os.environ.get("RATE_LIMIT_DELAY", "0.8"))

# ── Proxy Configuration ──────────────────────────────────────────────────────
# Set PROXY_URL env var for paid proxy services:
#   ScraperAPI:  PROXY_URL=http://scraperapi:APIKEY@proxy-server.scraperapi.com:8001
#   Bright Data: PROXY_URL=http://user:pass@brd.superproxy.io:22225
#   Smartproxy:  PROXY_URL=http://user:pass@gate.smartproxy.com:7000
#   Or any HTTP/HTTPS/SOCKS5 proxy URL
#
# If not set, the ProxyManager will attempt to use free proxies from public lists.
# Free proxies are less reliable but cost nothing.
PROXY_URL = os.environ.get("PROXY_URL", "")

# Number of proxy rotation retries before giving up
MAX_PROXY_RETRIES = int(os.environ.get("MAX_PROXY_RETRIES", "3"))

# Timeout for requests (seconds)
REQUEST_TIMEOUT = int(os.environ.get("REQUEST_TIMEOUT", "20"))

# ── User-Agent Rotation ─────────────────────────────────────────────────────
# 30+ realistic browser user agents to rotate through
USER_AGENTS = [
    # Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    # Chrome on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    # Firefox on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
    # Safari on Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
    # Chrome on Linux
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    # Chrome on ChromeOS
    "Mozilla/5.0 (X11; CrOS x86_64 14526.89.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    # Mobile Chrome (Android)
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    # Mobile Safari (iOS)
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]

# SEC EDGAR requires a User-Agent with contact info
SEC_USER_AGENT = (
    "SigmaCapital/1.0 (contact@sigmacapital.io) "
    "Financial data aggregation for research purposes"
)

# Legacy alias
USER_AGENT = SEC_USER_AGENT


def random_user_agent() -> str:
    """Return a random browser user-agent string."""
    return random.choice(USER_AGENTS)


# ── Proxy Manager ────────────────────────────────────────────────────────────

class ProxyManager:
    """
    Manages a pool of proxies with rotation and health checking.

    Modes:
      1. Single proxy via PROXY_URL env var (paid services like ScraperAPI/Bright Data)
      2. Free proxy pool fetched from public proxy list APIs
      3. No proxy (direct connection) if no proxies available

    Usage:
        pm = ProxyManager()
        proxies = pm.get_proxies()          # {"http": "...", "https": "..."}
        session = pm.get_session()           # requests.Session with proxy + retries
        yf_session = pm.get_yfinance_session() # for yfinance
    """

    def __init__(self):
        self._free_proxies: list[str] = []
        self._proxy_index = 0
        self._last_fetch = 0.0
        self._fetch_interval = 300  # Refresh free list every 5 min
        self._paid_proxy_url = PROXY_URL
        self._session_cache: Optional[requests.Session] = None

        if self._paid_proxy_url:
            print(f"  🔌 Proxy: Using paid proxy service")
        else:
            print(f"  🔌 Proxy: Using free proxy pool (no PROXY_URL set)")

    @property
    def is_paid_proxy(self) -> bool:
        """Check if using a paid proxy service."""
        return bool(self._paid_proxy_url)

    def get_proxies(self) -> Optional[dict[str, str]]:
        """
        Get proxy configuration dict for requests.
        Returns {"http": url, "https": url} or None if no proxy available.
        """
        if self._paid_proxy_url:
            return {
                "http": self._paid_proxy_url,
                "https": self._paid_proxy_url,
            }

        # Try to get a free proxy
        proxy = self._get_next_free_proxy()
        if proxy:
            return {
                "http": proxy,
                "https": proxy,
            }

        return None

    def get_rotating_proxies(self) -> Optional[dict[str, str]]:
        """
        Get a fresh proxy (rotates on each call for paid services that support it).
        For paid services with session-based rotation, appends a random session param.
        """
        if self._paid_proxy_url:
            # Many paid services (ScraperAPI, etc.) rotate on each request
            # Some support session parameter for sticky sessions
            return {
                "http": self._paid_proxy_url,
                "https": self._paid_proxy_url,
            }

        return self.get_proxies()

    def _get_next_free_proxy(self) -> Optional[str]:
        """Get the next free proxy from the pool, refreshing if needed."""
        now = time.time()

        # Refresh pool if empty or stale
        if not self._free_proxies or (now - self._last_fetch) > self._fetch_interval:
            self._fetch_free_proxies()

        if not self._free_proxies:
            return None

        # Round-robin rotation
        proxy = self._free_proxies[self._proxy_index % len(self._free_proxies)]
        self._proxy_index += 1
        return proxy

    def _fetch_free_proxies(self) -> None:
        """Fetch free proxies from public proxy list APIs."""
        print("  🔄 Refreshing free proxy pool …")
        proxies = []

        # Source 1: free-proxy-list.net (scraped)
        try:
            resp = requests.get(
                "https://api.proxyscrape.com/v2/?request=displayproxies"
                "&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all",
                timeout=10,
            )
            if resp.ok:
                for line in resp.text.strip().split("\n"):
                    line = line.strip()
                    if ":" in line and len(line) < 30:
                        proxies.append(f"http://{line}")
        except Exception:
            pass

        # Source 2: proxy-list.download
        try:
            resp = requests.get(
                "https://www.proxy-list.download/api/v1/get",
                params={"type": "http", "anon": "elite", "timeout": 5000},
                timeout=10,
            )
            if resp.ok:
                for line in resp.text.strip().split("\n"):
                    line = line.strip()
                    if ":" in line and len(line) < 30:
                        proxies.append(f"http://{line}")
        except Exception:
            pass

        # Validate a subset (test first 10)
        validated = self._validate_proxies(proxies[:20])

        if validated:
            self._free_proxies = validated
            self._last_fetch = time.time()
            print(f"  ✓ Free proxy pool: {len(validated)} working proxies")
        else:
            # Keep existing proxies if validation fails
            if not self._free_proxies:
                print("  ⚠ No working free proxies found — using direct connection")
            else:
                print(f"  ⚠ Refresh failed — keeping {len(self._free_proxies)} existing proxies")

    def _validate_proxies(self, proxies: list[str], max_concurrent: int = 10) -> list[str]:
        """Test proxies by making a quick request to httpbin."""
        import concurrent.futures

        validated = []

        def test_proxy(proxy_url: str) -> Optional[str]:
            try:
                resp = requests.get(
                    "https://httpbin.org/ip",
                    proxies={"http": proxy_url, "https": proxy_url},
                    timeout=8,
                )
                if resp.ok:
                    return proxy_url
            except Exception:
                pass
            return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent) as executor:
            futures = {executor.submit(test_proxy, p): p for p in proxies}
            for future in concurrent.futures.as_completed(futures, timeout=30):
                try:
                    result = future.result()
                    if result:
                        validated.append(result)
                except Exception:
                    pass

        return validated

    def get_session(self, headers: Optional[dict] = None) -> requests.Session:
        """
        Create a requests.Session with proxy, retry logic, and user-agent rotation.
        """
        session = requests.Session()

        # Retry strategy: up to 3 retries with exponential backoff
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        # Set proxy
        proxies = self.get_proxies()
        if proxies:
            session.proxies.update(proxies)

        # Set headers
        default_headers = {
            "User-Agent": random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        if headers:
            default_headers.update(headers)
        session.headers.update(default_headers)

        return session

    def get_yfinance_session(self) -> requests.Session:
        """
        Create a requests.Session configured for yfinance with proxy support.
        yfinance uses requests internally, so we pass a custom session.
        """
        session = requests.Session()

        # yfinance-specific retry strategy (more aggressive)
        retry_strategy = Retry(
            total=5,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD", "POST"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        # Set proxy
        proxies = self.get_proxies()
        if proxies:
            session.proxies.update(proxies)

        # yfinance headers
        session.headers.update({
            "User-Agent": random_user_agent(),
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
        })

        return session


# ── Global Proxy Manager (singleton) ─────────────────────────────────────────
_proxy_manager: Optional[ProxyManager] = None


def get_proxy_manager() -> ProxyManager:
    """Get or create the global ProxyManager singleton."""
    global _proxy_manager
    if _proxy_manager is None:
        _proxy_manager = ProxyManager()
    return _proxy_manager


# ── Market Hours ─────────────────────────────────────────────────────────────

def is_market_hours() -> bool:
    """Return True if current time is Mon-Fri 9:30-16:00 Eastern Time."""
    from zoneinfo import ZoneInfo

    et = ZoneInfo("US/Eastern")
    now = datetime.now(et)
    if now.weekday() >= 5:
        return False
    market_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return market_open <= now <= market_close


# ── JSON Helpers ─────────────────────────────────────────────────────────────

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


# ── HTTP Helpers ─────────────────────────────────────────────────────────────

def safe_get(url: str, headers: dict | None = None, timeout: int = REQUEST_TIMEOUT,
             max_retries: int = MAX_PROXY_RETRIES, use_proxy: bool = True):
    """
    Make a GET request with proxy rotation, retry logic, and exponential backoff.
    Rotates user-agent and proxy on each retry attempt.
    Returns response or None.
    """
    default_headers = {
        "User-Agent": random_user_agent(),
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "application/json, text/html, */*",
    }
    if headers:
        default_headers.update(headers)

    pm = get_proxy_manager() if use_proxy else None

    for attempt in range(max_retries):
        try:
            # Rotate user-agent on each attempt
            default_headers["User-Agent"] = random_user_agent()

            # Get rotating proxy
            proxies = pm.get_rotating_proxies() if pm and use_proxy else None

            resp = requests.get(
                url,
                headers=default_headers,
                timeout=timeout,
                proxies=proxies,
            )
            resp.raise_for_status()
            return resp

        except requests.exceptions.HTTPError as exc:
            status_code = getattr(exc.response, "status_code", 0)
            if status_code == 429:
                # Rate limited — exponential backoff
                wait = (2 ** attempt) + random.uniform(0, 1)
                print(f"  ⏳ Rate limited (429), retrying in {wait:.1f}s … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            elif status_code in (403, 406):
                # Forbidden / Not Acceptable — might be blocked, try different proxy
                if attempt < max_retries - 1:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    print(f"  🔄 Blocked ({status_code}), rotating proxy … (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait)
                    continue
            print(f"  ✗ GET {url} failed: HTTP {status_code}")
            return None

        except requests.exceptions.ProxyError:
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 0.5)
                print(f"  🔄 Proxy error, rotating … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed: Proxy error after {max_retries} attempts")
            return None

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 0.5)
                print(f"  ⏳ Timeout, retrying … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed: Timeout after {max_retries} attempts")
            return None

        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 0.5)
                print(f"  🔄 Connection error, rotating proxy … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed: Connection error after {max_retries} attempts")
            return None

        except Exception as exc:
            print(f"  ✗ GET {url} failed: {exc}")
            return None

    return None


def safe_get_with_session(session: requests.Session, url: str,
                          headers: dict | None = None, timeout: int = REQUEST_TIMEOUT,
                          max_retries: int = MAX_PROXY_RETRIES):
    """
    Make a GET request using an existing session (with proxy already configured).
    Includes retry logic with exponential backoff.
    """
    request_headers = {"User-Agent": random_user_agent()}
    if headers:
        request_headers.update(headers)

    for attempt in range(max_retries):
        try:
            request_headers["User-Agent"] = random_user_agent()
            resp = session.get(url, headers=request_headers, timeout=timeout)
            resp.raise_for_status()
            return resp

        except requests.exceptions.HTTPError as exc:
            status_code = getattr(exc.response, "status_code", 0)
            if status_code == 429:
                wait = (2 ** attempt) + random.uniform(0, 1)
                print(f"  ⏳ Rate limited (429), retrying in {wait:.1f}s … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            elif status_code in (403, 406) and attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 1)
                print(f"  🔄 Blocked ({status_code}), retrying … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed: HTTP {status_code}")
            return None

        except (requests.exceptions.ProxyError, requests.exceptions.Timeout,
                requests.exceptions.ConnectionError):
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 0.5)
                print(f"  🔄 Network error, retrying … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed after {max_retries} attempts")
            return None

        except Exception as exc:
            print(f"  ✗ GET {url} failed: {exc}")
            return None

    return None


# ── Rate Limiting ────────────────────────────────────────────────────────────

def rate_limit() -> None:
    """Sleep for RATE_LIMIT_DELAY seconds with small random jitter."""
    jitter = random.uniform(0, 0.3)
    time.sleep(RATE_LIMIT_DELAY + jitter)


# ── Utility Helpers ──────────────────────────────────────────────────────────

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


def get_yf_ticker(symbol: str):
    """
    Create a yfinance Ticker with proxy-enabled session.
    Usage:
        ticker = get_yf_ticker("AAPL")
        info = ticker.info
        hist = ticker.history(period="5d")
    """
    import yfinance as yf
    pm = get_proxy_manager()
    session = pm.get_yfinance_session()
    ticker = yf.Ticker(symbol, session=session)
    return ticker
