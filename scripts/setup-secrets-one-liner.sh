#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Sigma Capital — Quick GitHub Secrets Setup (One-Liner Mode)
#
# Run this script with your API keys as arguments or environment variables.
# Requires: GitHub CLI (gh) authenticated
#
# Usage:
#   export CLOUDFLARE_API_TOKEN=cfut_xxx
#   export CLOUDFLARE_ACCOUNT_ID=xxx
#   export SERPER_API_KEY_1=xxx
#   export SERPER_API_KEY_2=xxx
#   export TAVILY_API_KEY=tvly-xxx
#   export FREEPIK_API_KEY=FPSXxxx
#   bash scripts/setup-secrets-one-liner.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO="horsnel/kimi-agent-build"

echo "🔐 Setting GitHub secrets for $REPO..."

# Verify gh auth
gh auth status &> /dev/null || { echo "❌ Run: gh auth login"; exit 1; }

# Set each secret from environment variable
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN not set}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID not set}"
: "${SERPER_API_KEY_1:?SERPER_API_KEY_1 not set}"
: "${TAVILY_API_KEY:?TAVILY_API_KEY not set}"

echo "$CLOUDFLARE_API_TOKEN"  | gh secret set CLOUDFLARE_API_TOKEN  --repo "$REPO" && echo "✅ CLOUDFLARE_API_TOKEN"
echo "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO" && echo "✅ CLOUDFLARE_ACCOUNT_ID"
echo "$SERPER_API_KEY_1"      | gh secret set SERPER_API_KEY_1     --repo "$REPO" && echo "✅ SERPER_API_KEY_1"

[ -n "${SERPER_API_KEY_2:-}" ] && { echo "$SERPER_API_KEY_2" | gh secret set SERPER_API_KEY_2 --repo "$REPO" && echo "✅ SERPER_API_KEY_2"; } || echo "⚠️  SERPER_API_KEY_2 skipped (not set)"
[ -n "${TAVILY_API_KEY:-}" ]  && { echo "$TAVILY_API_KEY"  | gh secret set TAVILY_API_KEY  --repo "$REPO" && echo "✅ TAVILY_API_KEY"; }  || echo "⚠️  TAVILY_API_KEY skipped"
[ -n "${FREEPIK_API_KEY:-}" ] && { echo "$FREEPIK_API_KEY" | gh secret set FREEPIK_API_KEY --repo "$REPO" && echo "✅ FREEPIK_API_KEY"; } || echo "⚠️  FREEPIK_API_KEY skipped"

echo ""
echo "✅ All secrets configured! Verify with: gh secret list --repo $REPO"
