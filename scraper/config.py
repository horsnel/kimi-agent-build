"""
Shared configuration and helper utilities for Sigma Capital scrapers.

Features:
  - ScrapingAnt integration: dual API key rotation with proxy + API modes
  - User-agent rotation (16+ realistic browser UAs)
  - safe_get() with ScrapingAnt proxy/API, retries, and exponential backoff
  - safe_get_rendered() for JavaScript-heavy pages (uses ScrapingAnt headless browser)
  - yfinance session factory with proxy support
  - No other API keys required — all sources are free/public
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
# ScrapingAnt provides rotating proxies + headless Chrome rendering.
# Set SCRAPINGANT_API_KEY_1 and SCRAPINGANT_API_KEY_2 env vars (or single SCRAPINGANT_API_KEY).
# Free tier: 10,000 API credits/month per key = 20,000/month total with dual rotation.
SCRAPINGANT_API_KEY_1 = os.environ.get("SCRAPINGANT_API_KEY_1", "")
SCRAPINGANT_API_KEY_2 = os.environ.get("SCRAPINGANT_API_KEY_2", "")
SCRAPINGANT_API_KEY = os.environ.get("SCRAPINGANT_API_KEY", "")  # Fallback single key

# ScrapingAnt endpoints
SCRAPINGANT_PROXY_HOST = "proxy.scrapingant.com"
SCRAPINGANT_PROXY_PORT = 8085
SCRAPINGANT_API_URL = "https://api.scrapingant.com/v2/general"

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
    Manages ScrapingAnt proxy rotation with dual API keys.

    Modes (priority order):
      1. ScrapingAnt Proxy Mode — rotating HTTP proxy through ScrapingAnt's pool
         Format: http://API_KEY:@proxy.scrapingant.com:8085
         Each request gets a different IP automatically.

      2. ScrapingAnt API Mode — for JavaScript-heavy pages (CNN, etc.)
         POST to https://api.scrapingant.com/v2/general
         Renders pages in headless Chrome, bypasses anti-bot.

      3. Generic PROXY_URL — fallback for ScraperAPI, Bright Data, etc.

      4. Free proxy pool — last resort, unreliable but free.

      5. Direct connection — no proxy at all.

    Smart fallback: If ScrapingAnt proxy fails repeatedly, automatically
    disables it and falls back to direct/free proxies for the session.
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
        self._free_proxies: list[str] = []
        self._free_proxy_index = 0
        self._last_free_fetch = 0.0

        # Smart fallback: track failures and auto-disable broken keys
        self._ant_proxy_failures = 0
        self._ant_proxy_disabled = False
        self._ant_api_failures = 0
        self._ant_api_disabled = False
        self._max_failures_before_disable = 3

        # Report mode at startup
        if self._ant_keys:
            print(f"  🔌 Proxy: ScrapingAnt ({len(self._ant_keys)} key(s), rotating)")
        elif self._generic_proxy:
            print(f"  🔌 Proxy: Generic paid proxy")
        else:
            print(f"  🔌 Proxy: Free pool / direct (no ScrapingAnt key set)")

    @property
    def has_scrapingant(self) -> bool:
        return bool(self._ant_keys)

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

    # ── Proxy Mode (for requests/yfinance) ────────────────────────────────

    def get_proxies(self) -> Optional[dict[str, str]]:
        """
        Get proxy config dict for requests library.
        Priority: ScrapingAnt proxy > generic proxy > free proxy > None (direct)
        Smart fallback: auto-disables ScrapingAnt if it fails repeatedly.
        """
        # Mode 1: ScrapingAnt proxy mode (if not disabled)
        if self._ant_keys and not self._ant_proxy_disabled:
            key = self._get_next_ant_key()
            proxy_url = f"http://{key}:@{SCRAPINGANT_PROXY_HOST}:{SCRAPINGANT_PROXY_PORT}"
            return {"http": proxy_url, "https": proxy_url}

        # Mode 2: Generic paid proxy
        if self._generic_proxy:
            return {"http": self._generic_proxy, "https": self._generic_proxy}

        # Mode 3: Free proxy pool
        free = self._get_free_proxy()
        if free:
            return {"http": free, "https": free}

        # Mode 4: Direct connection (no proxy)
        return None

    def report_proxy_failure(self) -> None:
        """Called when a proxy request fails. Auto-disables after threshold."""
        self._ant_proxy_failures += 1
        if self._ant_proxy_failures >= self._max_failures_before_disable and not self._ant_proxy_disabled:
            self._ant_proxy_disabled = True
            print(f"  ⚠ ScrapingAnt proxy disabled for this session (too many failures), falling back to direct connection")

    def report_proxy_success(self) -> None:
        """Called when a proxy request succeeds. Resets failure counter."""
        self._ant_proxy_failures = 0

    def get_rotating_proxies(self) -> Optional[dict[str, str]]:
        """Same as get_proxies() — ScrapingAnt rotates IP on every request."""
        return self.get_proxies()

    # ── API Mode (for JavaScript rendering) ───────────────────────────────

    def scrape_via_api(self, url: str, render_js: bool = True,
                       wait_for_selector: str = "",
                       timeout: int = 30000) -> Optional[requests.Response]:
        """
        Scrape a URL using ScrapingAnt's API (headless Chrome rendering).
        Use this for JavaScript-heavy pages like CNN Fear & Greed.

        Args:
            url: Target URL to scrape
            render_js: Whether to render JavaScript (costs more credits)
            wait_for_selector: CSS selector to wait for before returning
            timeout: Maximum wait time in ms

        Returns:
            requests.Response-like object with .text and .status_code, or None
        """
        if not self._ant_keys:
            return None

        key = self._get_next_ant_key()

        try:
            payload: dict = {
                "url": url,
                "browser": render_js,
            }
            if wait_for_selector:
                payload["wait_for_selector"] = wait_for_selector

            resp = requests.post(
                SCRAPINGANT_API_URL,
                json=payload,
                headers={
                    "x-api-key": key,
                    "Content-Type": "application/json",
                },
                timeout=timeout // 1000 + 5,
            )
            resp.raise_for_status()
            return resp

        except requests.exceptions.HTTPError as exc:
            status = getattr(exc.response, "status_code", 0)
            if status == 429:
                print(f"  ⏳ ScrapingAnt rate limited, will retry with other key")
            elif status == 403:
                print(f"  ✗ ScrapingAnt API key invalid or quota exceeded")
            else:
                print(f"  ✗ ScrapingAnt API error: HTTP {status}")
            return None
        except Exception as exc:
            print(f"  ✗ ScrapingAnt API failed: {exc}")
            return None

    # ── Session Factory ───────────────────────────────────────────────────

    def get_session(self, headers: Optional[dict] = None) -> requests.Session:
        """Create a requests.Session with ScrapingAnt proxy and retry logic."""
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

        proxies = self.get_proxies()
        if proxies:
            session.proxies.update(proxies)

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
        """Create a requests.Session for yfinance with ScrapingAnt proxy."""
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

        proxies = self.get_proxies()
        if proxies:
            session.proxies.update(proxies)

        session.headers.update({
            "User-Agent": random_user_agent(),
            "Accept": "application/json, text/plain, */*",
            "Accept-Encoding": "gzip, deflate, br",
        })

        return session

    # ── Free Proxy Pool (fallback) ────────────────────────────────────────

    def _get_free_proxy(self) -> Optional[str]:
        now = time.time()
        if not self._free_proxies or (now - self._last_free_fetch) > 300:
            self._fetch_free_proxies()
        if not self._free_proxies:
            return None
        proxy = self._free_proxies[self._free_proxy_index % len(self._free_proxies)]
        self._free_proxy_index += 1
        return proxy

    def _fetch_free_proxies(self) -> None:
        """Fetch and validate free proxies from public lists."""
        print("  🔄 Refreshing free proxy pool …")
        proxies = []

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

        validated = self._validate_proxies(proxies[:15])

        if validated:
            self._free_proxies = validated
            self._last_free_fetch = time.time()
            print(f"  ✓ Free proxy pool: {len(validated)} working proxies")
        else:
            if not self._free_proxies:
                print("  ⚠ No working free proxies — using direct connection")
            else:
                print(f"  ⚠ Refresh failed — keeping {len(self._free_proxies)} existing")

    def _validate_proxies(self, proxies: list[str]) -> list[str]:
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

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(test_proxy, p): p for p in proxies}
            for future in concurrent.futures.as_completed(futures, timeout=30):
                try:
                    result = future.result()
                    if result:
                        validated.append(result)
                except Exception:
                    pass
        return validated


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
    Make a GET request with ScrapingAnt proxy rotation, retry logic, and backoff.
    Rotates API key and user-agent on each retry attempt.
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
            default_headers["User-Agent"] = random_user_agent()
            proxies = pm.get_rotating_proxies() if pm and use_proxy else None

            resp = requests.get(
                url,
                headers=default_headers,
                timeout=timeout,
                proxies=proxies,
            )
            resp.raise_for_status()
            if pm and use_proxy:
                pm.report_proxy_success()
            return resp

        except requests.exceptions.HTTPError as exc:
            status_code = getattr(exc.response, "status_code", 0)
            if status_code == 429:
                wait = (2 ** attempt) + random.uniform(0, 1)
                print(f"  ⏳ Rate limited (429), retrying in {wait:.1f}s … (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            elif status_code in (403, 406):
                if pm and use_proxy:
                    pm.report_proxy_failure()
                if attempt < max_retries - 1:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    print(f"  🔄 Blocked ({status_code}), rotating proxy/key … (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait)
                    continue
            print(f"  ✗ GET {url} failed: HTTP {status_code}")
            return None

        except requests.exceptions.ProxyError:
            if pm and use_proxy:
                pm.report_proxy_failure()
            if attempt < max_retries - 1:
                wait = (2 ** attempt) + random.uniform(0, 0.5)
                print(f"  🔄 Proxy error, rotating key … (attempt {attempt + 1}/{max_retries})")
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
                print(f"  🔄 Connection error, rotating … (attempt {attempt + 1}/{max_retries})")
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

    # Try ScrapingAnt API mode first (headless Chrome rendering)
    if pm.has_scrapingant:
        print(f"  🌐 ScrapingAnt API: rendering {url[:60]}…")
        resp = pm.scrape_via_api(url, render_js=True, wait_for_selector=wait_for, timeout=timeout)
        if resp is not None:
            try:
                data = resp.json()
                content = data.get("content", data.get("text", ""))
                if content:
                    # Wrap in a Response-like object
                    mock_resp = requests.Response()
                    mock_resp.status_code = 200
                    mock_resp._content = content.encode("utf-8") if isinstance(content, str) else content
                    print(f"  ✓ ScrapingAnt rendered: {len(content)} chars")
                    return mock_resp
            except Exception:
                pass

    # Fallback to regular safe_get (no JS rendering)
    print(f"  ⚠ ScrapingAnt API unavailable, falling back to safe_get")
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
    Create a yfinance Ticker with ScrapingAnt proxy-enabled session.
    Each call gets a fresh session with a potentially rotated API key.
    """
    import yfinance as yf
    pm = get_proxy_manager()
    session = pm.get_yfinance_session()
    ticker = yf.Ticker(symbol, session=session)
    return ticker
