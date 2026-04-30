# Task 11 - GitHub Actions Workflows

## Summary
Created 5 complete GitHub Actions workflow files for the financial data scraping platform (Sigma Capital). These workflows automate data scraping on different schedules and handle CI/CD deployment.

## Files Created

### 1. `.github/workflows/scrape-intraday.yml`
- **Schedule**: Every 15 minutes during US market hours (Mon-Fri, 9AM-5PM ET = 13:00-21:00 UTC)
- **Trigger**: cron + manual workflow_dispatch
- **Steps**: checkout → setup-python 3.12 (with pip cache) → install deps → run `scraper/run_intraday.py` → commit & push data to `public/data/`
- **Commit message**: "📊 intraday data update {timestamp}"

### 2. `.github/workflows/scrape-daily.yml`
- **Schedule**: Daily at 6 AM UTC (2 AM ET)
- **Trigger**: cron + manual workflow_dispatch
- **Timeout**: 30 minutes
- **Steps**: checkout → setup-python 3.12 → install deps → run `scraper/run_daily.py` → commit & push
- **Commit message**: "📅 daily data refresh {date}"

### 3. `.github/workflows/scrape-hourly.yml`
- **Schedule**: Every hour
- **Trigger**: cron + manual workflow_dispatch
- **Steps**: checkout → setup-python 3.12 → install deps → run 3 scrapers inline (crypto, fear_greed, news) with try/except per scraper → commit & push
- **Commit message**: "⏰ hourly data update {timestamp}"
- **Resilience**: Each scraper runs independently; one failure doesn't block others

### 4. `.github/workflows/deploy-preview.yml`
- **Trigger**: Push to main branch + manual workflow_dispatch
- **Steps**: checkout → setup-node 20 (with npm cache) → npm ci → npm run build → deploy to Cloudflare Pages
- **Secrets**: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- **Project**: sigma-capital, directory: dist

### 5. `.github/workflows/test-scraper.yml`
- **Trigger**: PRs with changes to `scraper/**` + manual workflow_dispatch
- **Steps**: checkout → setup-python 3.12 → install deps → test all module imports (config, stocks, crypto, economic, fear_greed, news) → quick test of fear_greed scraper
- **Validation**: Import test ensures no broken dependencies; quick scraper test does a real API call

## Architecture
- GitHub Actions runs Python scrapers on cron schedules
- Scrapers write JSON data to `public/data/`
- Data is committed back to the repo automatically
- Cloudflare Pages auto-deploys on push to main
- CI gate: PRs touching scraper code must pass import + quick execution tests
