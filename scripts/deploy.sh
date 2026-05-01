#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Sigma Capital — Local Deploy Helper Script
#
# Builds and deploys to Cloudflare Pages from the local machine.
# Useful for quick manual deployments or CI/CD debugging.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh              # Build + deploy
#   ./scripts/deploy.sh --fetch      # Fetch data first, then build + deploy
#   ./scripts/deploy.sh --build-only # Only build, skip deploy
#   ./scripts/deploy.sh --dry-run    # Show what would happen
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="sigma-capital"
DIST_DIR="$PROJECT_ROOT/dist"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FETCH_DATA=false
BUILD_ONLY=false
DRY_RUN=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --fetch)      FETCH_DATA=true ;;
        --build-only) BUILD_ONLY=true ;;
        --dry-run)    DRY_RUN=true ;;
        --help|-h)
            echo "Usage: $0 [--fetch] [--build-only] [--dry-run]"
            echo ""
            echo "  --fetch       Run fetch-real-data.cjs before building"
            echo "  --build-only  Build but skip Cloudflare deployment"
            echo "  --dry-run     Show commands without executing"
            exit 0
            ;;
    esac
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Sigma Capital — Deploy Helper${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

# ── STEP 1: Fetch data (optional) ────────────────────────────────────────────
if [ "$FETCH_DATA" = true ]; then
    echo -e "${YELLOW}📡 Step 1: Fetching real-time data...${NC}"
    if [ "$DRY_RUN" = true ]; then
        echo "  node scripts/fetch-real-data.cjs --type=all"
    else
        node scripts/fetch-real-data.cjs --type=all
        echo -e "${GREEN}  ✅ Data fetched${NC}"
    fi
    echo ""
fi

# ── STEP 2: Build ────────────────────────────────────────────────────────────
echo -e "${YELLOW}🏗️  Step 2: Building Vite project...${NC}"
if [ "$DRY_RUN" = true ]; then
    echo "  npm run build"
else
    npm run build

    if [ ! -d "$DIST_DIR" ]; then
        echo -e "${RED}  ❌ Build failed — dist/ directory not found${NC}"
        exit 1
    fi

    BUILD_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
    FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l)
    echo -e "${GREEN}  ✅ Build complete${NC} ($BUILD_SIZE, $FILE_COUNT files)"
fi
echo ""

# ── STEP 3: Deploy ───────────────────────────────────────────────────────────
if [ "$BUILD_ONLY" = true ]; then
    echo -e "${YELLOW}⏭️  Step 3: Skipping deploy (--build-only)${NC}"
    echo -e "  Preview locally: ${BLUE}npx vite preview${NC}"
    exit 0
fi

echo -e "${YELLOW}🚀 Step 3: Deploying to Cloudflare Pages...${NC}"

# Check for Cloudflare API token
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo -e "${RED}  ❌ CLOUDFLARE_API_TOKEN not set${NC}"
    echo ""
    echo "  Set it before running:"
    echo "    export CLOUDFLARE_API_TOKEN=cfut_your_token_here"
    echo ""
    echo "  Or use --build-only to skip deployment"
    exit 1
fi

# Check for Account ID
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
    echo -e "${YELLOW}  ⚠️  CLOUDFLARE_ACCOUNT_ID not set — deploying without account ID${NC}"
    DEPLOY_CMD="npx wrangler pages deploy dist --project-name=$PROJECT_NAME"
else
    DEPLOY_CMD="CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=$PROJECT_NAME"
fi

if [ "$DRY_RUN" = true ]; then
    echo "  $DEPLOY_CMD"
else
    eval "$DEPLOY_CMD"
    echo -e "${GREEN}  ✅ Deployed to https://$PROJECT_NAME.pages.dev${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 Deployment complete!${NC}"
echo -e "  📍 https://$PROJECT_NAME.pages.dev"
echo -e "  ⏰ $(date -u)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
