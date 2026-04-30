"""
Shared configuration and helper utilities for Sigma Capital scrapers.

Features:
  - ScrapingAnt integration: API mode with dual key rotation + JS rendering
  - User-agent rotation (16+ realistic browser UAs)
  - safe_get() routes through ScrapingAnt API for rotating IPs
  - safe_get_rendered() for JavaScript-heavy pages (ScrapingAnt headless Chrome)
  - yfinance session factory with direct + fallback support
  - No other API keys required — all sources are free/public

ScrapingAnt API:
  - v1/general (POST + JSON body) → returns {content, cookies, status_code}
  - v2/general (GET + ?url= query) → returns raw HTML
  - Each request automatically gets a different proxy IP
  - Optional headless Chrome rendering for JS-heavy pages
"""

import json
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "public" / "data"
STOCKS_DIR = DATA_DIR / "stocks"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STOCKS_DIR, exist_ok=True)

# ── Rate Limiting ────────────────────────────────────────────────────────────
RATE_LIMIT_DELAY = float(os.environ.get("RATE_LIMIT_DELAY", "0.6"))

# ── ScrapingAnt Configuration ────────────────────────────────────────────────
# ScrapingAnt provides rotating proxies + headless Chrome rendering via API.
# Set SCRAPINGANT_API_KEY_1 and SCRAPINGANT_API_KEY_2 env vars (or single SCRAPINGANT_API_KEY).
# Free tier: 10,000 API credits/month per key = 20,000/month total with dual rotation.
SCRAPINGANT_API_KEY_1 = os.environ.get("SCRAPINGANT_API_KEY_1", "f6fe4b49e4594684b96d5ecadf43718f")
SCRAPINGANT_API_KEY_2 = os.environ.get("SCRAPINGANT_API_KEY_2", "")
SCRAPINGANT_API_KEY = os.environ.get("SCRAPINGANT_API_KEY", "")  # Fallback single key

# ScrapingAnt API endpoints
# v1/general: POST with JSON body → {content, cookies, status_code}
# v2/general: GET with ?url= query param → raw HTML
SCRAPINGANT_API_URL_V1 = "https://api.scrapingant.com/v1/general"
SCRAPINGANT_API_URL_V2 = "https://api.scrapingant.com/v2/general"

# Fallback: generic PROXY_URL (ScraperAPI, Bright Data, etc.)
PROXY_URL = os.environ.get("PROXY_URL", "")

# Retry / timeout settings
MAX_PROXY_RETRIES = int(os.environ.get("MAX_PROXY_RETRIES", "3"))
REQUEST_TIMEOUT = int(os.environ.get("REQUEST_TIMEOUT", "20"))

# ── User-Agent Rotation ─────────────────────────────────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; CrOS x86_64 14526.89.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]

SEC_USER_AGENT = (
    "SigmaCapital/1.0 (contact@sigmacapital.io) "
    "Financial data aggregation for research purposes"
)
USER_AGENT = SEC_USER_AGENT


def random_user_agent() -> str:
    return random.choice(USER_AGENTS)


# ── ScrapingAnt Proxy Manager ────────────────────────────────────────────────

class ScrapingAntProxyManager:
    """
    Manages ScrapingAnt API-based proxy rotation with dual API keys.

    Architecture:
      ScrapingAnt routes ALL requests through their rotating proxy pool
      via the REST API (not SOCKS/HTTP proxy mode). Each API call gets a
      different exit IP automatically.

    Request flow:
      1. safe_get() → try ScrapingAnt v1/general API (rotating IP, no JS)
      2. If blocked/rate-limited → retry with different API key
      3. If ScrapingAnt fails → fallback to direct request
      4. safe_get_rendered() → ScrapingAnt v1/general with browser=True (JS rendering)

    Smart features:
      - Dual API key round-robin rotation (doubles monthly credits)
      - Auto-disable ScrapingAnt after repeated failures (falls back to direct)
      - Rate limit handling (429) with exponential backoff
      - Credit-efficient: uses browser=False for simple pages, browser=True only for JS
    """

    def __init__(self):
        # Collect all available ScrapingAnt keys
        self._ant_keys: list[str] = []
        if SCRAPINGANT_API_KEY_1:
            self._ant_keys.append(SCRAPINGANT_API_KEY_1)
        if SCRAPINGANT_API_KEY_2:
            self._ant_keys.append(SCRAPINGANT_API_KEY_2)
        if SCRAPINGANT_API_KEY and SCRAPINGANT_API_KEY not in self._ant_keys:
            self._ant_keys.append(SCRAPINGANT_API_KEY)

        self._key_index = 0
        self._generic_proxy = PROXY_URL

        # Smart fallback: track failures and auto-disable broken keys
        self._ant_api_failures = 0
        self._ant_api_disabled = False
        self._max_failures_before_disable = 5

        # Credit tracking (approximate)
        self._requests_via_api = 0
        self._requests_direct = 0

        # Report mode at startup
        if self._ant_keys:
            print(f"  🔌 Proxy: ScrapingAnt API ({len(self._ant_keys)} key(s), rotating IPs)")
        elif self._generic_proxy:
            print(f"  🔌 Proxy: Generic paid proxy")
        else:
            print(f"  🔌 Proxy: Direct (no ScrapingAnt key set)")

    @property
    def has_scrapingant(self) -> bool:
        return bool(self._ant_keys) and not self._ant_api_disabled

    @property
    def is_paid_proxy(self) -> bool:
        return bool(self._ant_keys or self._generic_proxy)

    def _get_next_ant_key(self) -> str:
        """Rotate to the next ScrapingAnt API key (round-robin)."""
        if not self._ant_keys:
            return ""
        key = self._ant_keys[self._key_index % len(self._ant_keys)]
        self._key_index += 1
        return key

    def report_api_failure(self) -> None:
        """Called when an API request fails. Auto-disables after threshold."""
        self._ant_api_failures += 1
        if self._ant_api_failures >= self._max_failures_before_disable and not self._ant_api_disabled:
            self._ant_api_disabled = True
            print(f"  ⚠ ScrapingAnt API disabled for this session (too many failures), using direct requests")

    def report_api_success(self) -> None:
        """Called when an API request succeeds. Resets failure counter."""
        self._ant_api_failures = 0

    # ── API Mode: Scrape via ScrapingAnt ──────────────────────────────────

    def scrape_via_api(self, url: str, render_js: bool = False,
                       wait_for_selector: str = "",
                       timeout: int = 25000) -> Optional[requests.Response]:
        """
        Scrape a URL using ScrapingAnt's v1/general API.

        Each request is routed through ScrapingAnt's rotating proxy pool,
        so every call gets a different exit IP automatically.

        Args:
            url: Target URL to scrape
            render_js: If True, render in headless Chrome (uses more credits)
            wait_for_selector: CSS selector to wait for (only with render_js=True)
            timeout: Maximum wait time in ms

        Returns:
            requests.Response with .text containing the page HTML, or None
        """
        if not self._ant_keys or self._ant_api_disabled:
            return None

        key = self._get_next_ant_key()

        try:
            payload: dict = {
                "url": url,
                "browser": render_js,
            }
            if wait_for_selector and render_js:
                payload["wait_for_selector"] = wait_for_selector

            resp = requests.post(
                SCRAPINGANT_API_URL_V1,
                json=payload,
                headers={
                    "x-api-key": key,
                    "Content-Type": "application/json",
                },
                timeout=timeout // 1000 + 10,
            )
            resp.raise_for_status()

            # v1 API returns: {"content": "<html>...", "cookies": "", "status_code": 200}
            data = resp.json()
            content = data.get("content", "")
            page_status = data.get("status_code", 200)

            if content:
                # Wrap in a Response-like object for compatibility
                mock_resp = requests.Response()
                mock_resp.status_code = page_status
                mock_resp._content = content.encode("utf-8") if isinstance(content, str) else content
                mock_resp.encoding = "utf-8"
                self._requests_via_api += 1
                self.report_api_success()
                return mock_resp
            else:
                return None

        except requests.exceptions.HTTPError as exc:
            status = getattr(exc.response, "status_code", 0)
            if status == 429:
                print(f"  ⏳ ScrapingAnt rate limited (429), will retry with other key")
            elif status == 403:
                print(f"  ✗ ScrapingAnt API key invalid or quota exceeded")
                self.report_api_failure()
            elif status == 422:
                # URL format issue — don't disable, just fail this request
                print(f"  ✗ ScrapingAnt API: invalid request for {url[:50]}")
            else:
                print(f"  ✗ ScrapingAnt API error: HTTP {status}")
                self.report_api_failure()
            return None
        except requests.exceptions.Timeout:
            print(f"  ⏳ ScrapingAnt API timeout for {url[:50]}")
            self.report_api_failure()
            return None
        except Exception as exc:
            print(f"  ✗ ScrapingAnt API failed: {exc}")
            self.report_api_failure()
            return None

    # ── Session Factory (for yfinance, etc.) ──────────────────────────────

    def get_session(self, headers: Optional[dict] = None) -> requests.Session:
        """Create a requests.Session with retry logic. Uses direct connection
        (yfinance needs its own connection handling)."""
        session = requests.Session()

        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        default_headers = {
            "User-Agent": random_user_agent(),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }
        if headers:
            default_headers.update(headers)
        session.headers.update(default_headers)

        return session

    def get_yfinance_session(self) -> requests.Session:
        """Create a requests.Session for yfinance with retry logic."""
        session = requests.Session()

        retry_strategy = Retry(
            total=5,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "HEAD", "POST"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        session.headers.update({
            "User-Agent": random_user_agent(),
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
        })

        return session

    def print_stats(self) -> None:
        """Print request statistics at end of session."""
        total = self._requests_via_api + self._requests_direct
        if total > 0:
            pct = self._requests_via_api / total * 100
            print(f"  📊 Requests: {self._requests_via_api} via ScrapingAnt, {self._requests_direct} direct ({pct:.0f}% proxied)")


# ── Global Proxy Manager (singleton) ─────────────────────────────────────────
_proxy_manager: Optional[ScrapingAntProxyManager] = None


def get_proxy_manager() -> ScrapingAntProxyManager:
    """Get or create the global ProxyManager singleton."""
    global _proxy_manager
    if _proxy_manager is None:
        _proxy_manager = ScrapingAntProxyManager()
    return _proxy_manager


# ── Market Hours ─────────────────────────────────────────────────────────────

def is_market_hours() -> bool:
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
    filepath = DATA_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"  ✓ Saved {filepath.relative_to(REPO_ROOT)} ({_size(filepath)})")


def _size(p: Path) -> str:
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
    Make a GET request with ScrapingAnt API rotation, retry logic, and backoff.

    Flow:
      1. Try ScrapingAnt v1/general API (rotating IP, no JS rendering — cheaper)
      2. If ScrapingAnt fails/unavailable → fallback to direct request
      3. On 429/403 → retry with exponential backoff + key rotation
    """
    pm = get_proxy_manager()

    for attempt in range(max_retries):
        # ── Try ScrapingAnt API first (if available) ──────────────────────
        if use_proxy and pm.has_scrapingant:
            resp = pm.scrape_via_api(url, render_js=False, timeout=timeout * 1000)
            if resp is not None:
                # Check if the response looks blocked (some sites block even proxy IPs)
                if resp.status_code in (403, 406, 503):
                    if attempt < max_retries - 1:
                        wait = (2 ** attempt) + random.uniform(0, 1)
                        print(f"  🔄 Blocked via ScrapingAnt ({resp.status_code}), retrying … (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait)
                        continue
                return resp

        # ── Fallback: Direct request ──────────────────────────────────────
        default_headers = {
            "User-Agent": random_user_agent(),
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "application/json, text/html, */*",
        }
        if headers:
            default_headers.update(headers)

        try:
            default_headers["User-Agent"] = random_user_agent()
            pm._requests_direct += 1

            resp = requests.get(
                url,
                headers=default_headers,
                timeout=timeout,
            )
            resp.raise_for_status()
            return resp

        except requests.exceptions.HTTPError as exc:
            status_code = getattr(exc.response, "status_code", 0)
            if status_code == 429:
                wait = (2 ** attempt) + random.uniform(0, 1)
                print(f"  ⏳ Rate limited (429), retrying in {wait:.1f}s … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            elif status_code in (403, 406):
                if attempt < max_retries - 1:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    print(f"  🔄 Blocked ({status_code}), retrying … (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait)
                    continue
            print(f"  ✗ GET {url} failed: HTTP {status_code}")
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
                print(f"  🔄 Connection error, retrying … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            print(f"  ✗ GET {url} failed: Connection error after {max_retries} attempts")
            return None

        except Exception as exc:
            print(f"  ✗ GET {url} failed: {exc}")
            return None

    return None


def safe_get_rendered(url: str, wait_for: str = "", timeout: int = 30000) -> Optional[requests.Response]:
    """
    Scrape a JavaScript-heavy page using ScrapingAnt's headless Chrome API.
    Falls back to safe_get() if ScrapingAnt is not configured.

    Use this for pages that require JavaScript rendering:
      - CNN Fear & Greed: safe_get_rendered("https://money.cnn.com/data/fear-and-greed/")
      - SEC EDGAR interactive pages
      - Any SPA or JS-rendered content
    """
    pm = get_proxy_manager()

    # Try ScrapingAnt API mode with headless Chrome rendering
    if pm.has_scrapingant:
        print(f"  🌐 ScrapingAnt: rendering JS for {url[:60]}…")
        resp = pm.scrape_via_api(url, render_js=True, wait_for_selector=wait_for, timeout=timeout)
        if resp is not None:
            print(f"  ✓ ScrapingAnt rendered: {len(resp.text)} chars")
            return resp

    # Fallback to regular safe_get (no JS rendering)
    print(f"  ⚠ ScrapingAnt JS rendering unavailable, falling back to safe_get")
    return safe_get(url, headers={"Accept": "text/html"})


# ── Rate Limiting ────────────────────────────────────────────────────────────

def rate_limit() -> None:
    jitter = random.uniform(0, 0.3)
    time.sleep(RATE_LIMIT_DELAY + jitter)


# ── Utility Helpers ──────────────────────────────────────────────────────────

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_float(value, default=None):
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def safe_int(value, default=None):
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def get_yf_ticker(symbol: str):
    """
    Create a yfinance Ticker with a retry-enabled session.
    yfinance handles its own connections; ScrapingAnt API is not used for yf
    since yf needs persistent sessions that don't work through REST APIs.
    """
    import yfinance as yf
    pm = get_proxy_manager()
    session = pm.get_yfinance_session()
    ticker = yf.Ticker(symbol, session=session)
    return ticker
