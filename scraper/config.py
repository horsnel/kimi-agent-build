"""
Shared configuration and helper utilities for Sigma Capital scrapers.

Features:
  - Credit-efficient ScrapingAnt: only used for sites that block or need JS rendering
  - Direct requests for public APIs (CoinGecko, FRED, etc.) — saves ScrapingAnt credits
  - Fallback chain: ScrapingAnt → free proxy pool → direct connection
  - safe_get(url, use_proxy=False) for public APIs (default, no credit cost)
  - safe_get(url, use_proxy=True) for sites that block scrapers
  - safe_get_rendered() for JS-heavy pages (CNN Fear & Greed)
  - yfinance session factory with retry logic
  - No other API keys required — all sources are free/public

ScrapingAnt Credit Strategy:
  FREE APIs (no proxy needed):
    - CoinGecko api.coingecko.com — free API, 30 req/min
    - FRED fred.stlouisfed.org — open government data
    - Alternative.me — free crypto F&G API
    - Blockchain.info — free on-chain API
    - NPR JSON feeds — public

  MODERATE (proxy optional — use_proxy=True recommended):
    - SEC EDGAR sec.gov — rate-limits to 10/sec, needs proper User-Agent
    - Reuters/CNBC/MarketWatch RSS — occasionally block IPs
    - yfinance (Yahoo Finance) — frequent rate-limiting

  BLOCKED / JS-RENDERED (use_proxy=True required):
    - CNN money.cnn.com — blocks scrapers, needs JS rendering
"""

import json
import os
import random
import time
import concurrent.futures
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

    Credit-efficient design:
      - safe_get(use_proxy=False) → direct request (FREE, no credit cost)
      - safe_get(use_proxy=True)  → ScrapingAnt rotating proxy (1 credit per request)
      - safe_get_rendered()       → ScrapingAnt with JS rendering (more credits)

    Fallback chain when ScrapingAnt credits exhausted:
      ScrapingAnt API → free proxy pool → direct connection

    Smart features:
      - Dual API key round-robin rotation (doubles monthly credits)
      - Auto-detect credit exhaustion (403 Forbidden) → falls back gracefully
      - Free proxy pool as intermediate fallback (better than nothing)
      - Credit tracking per session
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
        self._credits_exhausted = False  # True when we get 403/quota exceeded

        # Free proxy pool (fallback when ScrapingAnt is down/exhausted)
        self._free_proxies: list[str] = []
        self._free_proxy_index = 0
        self._last_free_fetch = 0.0

        # Credit tracking (approximate)
        self._requests_via_ant = 0
        self._requests_via_free_proxy = 0
        self._requests_direct = 0

        # Report mode at startup
        if self._ant_keys:
            print(f"  🔌 Proxy: ScrapingAnt API ({len(self._ant_keys)} key(s)) + free pool fallback")
        else:
            print(f"  🔌 Proxy: Free proxy pool + direct (no ScrapingAnt key)")

    @property
    def has_scrapingant(self) -> bool:
        return bool(self._ant_keys) and not self._ant_api_disabled

    @property
    def is_paid_proxy(self) -> bool:
        return bool(self._ant_keys or self._generic_proxy)

    @property
    def credits_exhausted(self) -> bool:
        return self._credits_exhausted

    def _get_next_ant_key(self) -> str:
        """Rotate to the next ScrapingAnt API key (round-robin)."""
        if not self._ant_keys:
            return ""
        key = self._ant_keys[self._key_index % len(self._ant_keys)]
        self._key_index += 1
        return key

    def report_api_failure(self, quota_exceeded: bool = False) -> None:
        """Called when an API request fails. Auto-disables after threshold."""
        if quota_exceeded:
            self._credits_exhausted = True
            self._ant_api_disabled = True
            print(f"  ⛔ ScrapingAnt credits exhausted! Falling back to free proxy pool → direct")
            return

        self._ant_api_failures += 1
        if self._ant_api_failures >= self._max_failures_before_disable and not self._ant_api_disabled:
            self._ant_api_disabled = True
            print(f"  ⚠ ScrapingAnt disabled for this session (too many failures)")
            print(f"  ⚠ Falling back to free proxy pool → direct connection")

    def report_api_success(self) -> None:
        """Called when an API request succeeds. Resets failure counter."""
        self._ant_api_failures = 0

    # ── ScrapingAnt API Mode ──────────────────────────────────────────────

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
                self._requests_via_ant += 1
                self.report_api_success()
                return mock_resp
            else:
                return None

        except requests.exceptions.HTTPError as exc:
            status = getattr(exc.response, "status_code", 0)
            resp_text = getattr(exc.response, "text", "")
            if status == 429:
                print(f"  ⏳ ScrapingAnt rate limited (429), will retry with other key")
            elif status == 403:
                # 403 = quota exceeded or invalid key
                print(f"  ⛔ ScrapingAnt 403: quota exceeded or key invalid")
                self.report_api_failure(quota_exceeded=True)
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

    # ── Free Proxy Pool (fallback when ScrapingAnt exhausted) ─────────────

    def get_free_proxy(self) -> Optional[dict[str, str]]:
        """Get a free proxy for requests library. Returns None if none available."""
        now = time.time()
        if not self._free_proxies or (now - self._last_free_fetch) > 300:
            self._fetch_free_proxies()
        if not self._free_proxies:
            return None
        proxy = self._free_proxies[self._free_proxy_index % len(self._free_proxies)]
        self._free_proxy_index += 1
        return {"http": proxy, "https": proxy}

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

    # ── Session Factory ───────────────────────────────────────────────────

    def get_session(self, headers: Optional[dict] = None) -> requests.Session:
        """Create a requests.Session with retry logic for direct connections."""
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
        total = self._requests_via_ant + self._requests_via_free_proxy + self._requests_direct
        if total > 0:
            ant_pct = self._requests_via_ant / total * 100
            free_pct = self._requests_via_free_proxy / total * 100
            dir_pct = self._requests_direct / total * 100
            print(f"  📊 Requests: {self._requests_via_ant} ScrapingAnt ({ant_pct:.0f}%) | "
                  f"{self._requests_via_free_proxy} free proxy ({free_pct:.0f}%) | "
                  f"{self._requests_direct} direct ({dir_pct:.0f}%)")
            if self._credits_exhausted:
                print(f"  ⛔ ScrapingAnt credits were exhausted this session — all requests went through fallback")


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
             max_retries: int = MAX_PROXY_RETRIES, use_proxy: bool = False):
    """
    Make a GET request with optional ScrapingAnt proxy rotation and smart fallback.

    CREDIT-SAVING DESIGN:
      use_proxy=False (DEFAULT) → Direct request first, ScrapingAnt only if blocked
      use_proxy=True            → ScrapingAnt API first (for sites known to block)

    Fallback chain when use_proxy=True:
      1. ScrapingAnt v1/general API (rotating proxy IP, no JS)
      2. Free proxy pool (if ScrapingAnt credits exhausted)
      3. Direct connection (last resort)

    Fallback chain when use_proxy=False:
      1. Direct request (free, no credit cost)
      2. If blocked (403/406) → retry via ScrapingAnt API
      3. If ScrapingAnt also fails → free proxy pool
    """
    pm = get_proxy_manager()

    for attempt in range(max_retries):
        if use_proxy:
            # ── Proxy-first mode: for sites that block scrapers ────────────
            # Priority: ScrapingAnt → free proxy pool → direct
            if pm.has_scrapingant:
                resp = pm.scrape_via_api(url, render_js=False, timeout=timeout * 1000)
                if resp is not None:
                    if resp.status_code in (403, 406, 503):
                        if attempt < max_retries - 1:
                            wait = (2 ** attempt) + random.uniform(0, 1)
                            print(f"  🔄 Blocked via ScrapingAnt ({resp.status_code}), retrying …")
                            time.sleep(wait)
                            continue
                    return resp

            # ScrapingAnt unavailable/exhausted → try free proxy pool
            if pm.credits_exhausted or not pm.has_scrapingant:
                free_proxies = pm.get_free_proxy()
                if free_proxies:
                    try:
                        pm._requests_via_free_proxy += 1
                        default_headers = {
                            "User-Agent": random_user_agent(),
                            "Accept": "application/json, text/html, */*",
                        }
                        if headers:
                            default_headers.update(headers)
                        resp = requests.get(url, headers=default_headers, timeout=timeout, proxies=free_proxies)
                        resp.raise_for_status()
                        return resp
                    except Exception:
                        pass  # Fall through to direct

            # Last resort: direct connection
            pm._requests_direct += 1

        else:
            # ── Direct-first mode: for public APIs (saves credits) ─────────
            # Priority: Direct request → ScrapingAnt if blocked → free proxy
            default_headers = {
                "User-Agent": random_user_agent(),
                "Accept-Encoding": "gzip, deflate, br",
                "Accept": "application/json, text/html, */*",
            }
            if headers:
                default_headers.update(headers)

        # ── Make the actual request (direct or proxy-fallback) ─────────────
        try:
            if not use_proxy:
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

            if not use_proxy and status_code in (403, 406):
                # Direct request blocked → escalate to ScrapingAnt
                if attempt < max_retries - 1 and pm.has_scrapingant:
                    print(f"  🔄 Direct request blocked ({status_code}), escalating to ScrapingAnt …")
                    resp = pm.scrape_via_api(url, render_js=False, timeout=timeout * 1000)
                    if resp is not None:
                        return resp
                # If ScrapingAnt also fails or unavailable → try free proxy
                if pm.credits_exhausted or not pm.has_scrapingant:
                    free_proxies = pm.get_free_proxy()
                    if free_proxies:
                        try:
                            pm._requests_via_free_proxy += 1
                            resp = requests.get(url, headers=default_headers, timeout=timeout, proxies=free_proxies)
                            resp.raise_for_status()
                            return resp
                        except Exception:
                            pass

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

    Fallback chain:
      1. ScrapingAnt API with browser=True (JS rendering)
      2. ScrapingAnt API with browser=False (no JS — might still work)
      3. Free proxy pool + regular GET (no JS rendering)
      4. Direct request (last resort)

    Use this for pages that require JavaScript rendering:
      - CNN Fear & Greed
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

        # JS rendering failed — try without JS (some pages work either way)
        print(f"  ⚠ JS rendering failed, trying without browser …")
        resp = pm.scrape_via_api(url, render_js=False, timeout=timeout)
        if resp is not None:
            print(f"  ✓ ScrapingAnt (no JS): {len(resp.text)} chars")
            return resp

    # ScrapingAnt exhausted → try free proxy pool
    if pm.credits_exhausted or not pm.has_scrapingant:
        free_proxies = pm.get_free_proxy()
        if free_proxies:
            try:
                pm._requests_via_free_proxy += 1
                print(f"  🔄 Trying free proxy for {url[:50]}…")
                resp = requests.get(
                    url,
                    headers={"User-Agent": random_user_agent(), "Accept": "text/html"},
                    timeout=20,
                    proxies=free_proxies,
                )
                resp.raise_for_status()
                return resp
            except Exception:
                pass

    # Last resort: direct request
    print(f"  ⚠ All proxy methods failed, falling back to direct request")
    return safe_get(url, headers={"Accept": "text/html"}, use_proxy=False)


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
    yfinance handles its own connections — uses direct requests (no ScrapingAnt).
    """
    import yfinance as yf
    pm = get_proxy_manager()
    session = pm.get_yfinance_session()
    ticker = yf.Ticker(symbol, session=session)
    return ticker
