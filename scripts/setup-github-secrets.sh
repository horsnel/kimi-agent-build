#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Sigma Capital — GitHub Secrets Setup Script
#
# This script configures ALL required GitHub repository secrets for the
# CI/CD pipeline (fetch-and-deploy.yml, generate-articles.yml, deploy.yml).
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - Repository: horsnel/kimi-agent-build
#
# Usage:
#   chmod +x scripts/setup-github-secrets.sh
#   ./scripts/setup-github-secrets.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO="horsnel/kimi-agent-build"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Sigma Capital — GitHub Secrets Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "   Install it: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo "📦 Repository: $REPO"
echo ""

# ── Required Secrets ──────────────────────────────────────────────────────────

SECRETS=(
    # Cloudflare
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_ACCOUNT_ID"

    # Serper.dev (Google Search API)
    "SERPER_API_KEY_1"
    "SERPER_API_KEY_2"

    # Tavily (AI Content Extraction)
    "TAVILY_API_KEY"

    # Freepik (Article Images)
    "FREEPIK_API_KEY"
)

echo "Required secrets to configure:"
for secret in "${SECRETS[@]}"; do
    echo "  - $secret"
done
echo ""

# ── Interactive Setup ─────────────────────────────────────────────────────────

echo "Choose setup method:"
echo "  1) Enter API keys interactively"
echo "  2) Use environment variables (export before running)"
echo "  3) Dry run (show commands without executing)"
echo ""
read -rp "Enter choice [1/2/3]: " CHOICE

set_secret() {
    local name="$1"
    local value="$2"
    if [ -z "$value" ]; then
        echo "  ⚠ Skipping $name (empty value)"
        return
    fi
    echo "  Setting $name..."
    if [ "$CHOICE" = "3" ]; then
        echo "    gh secret set $name --repo $REPO"
    else
        echo "$value" | gh secret set "$name" --repo "$REPO"
        echo "  ✅ $name set"
    fi
}

case $CHOICE in
    1)
        echo ""
        echo "Enter API keys (press Enter to skip):"
        echo ""

        read -rsp "CLOUDFLARE_API_TOKEN: " CF_TOKEN && echo ""
        read -rp "CLOUDFLARE_ACCOUNT_ID: " CF_ACCOUNT && echo ""
        read -rsp "SERPER_API_KEY_1: " SERPER1 && echo ""
        read -rsp "SERPER_API_KEY_2: " SERPER2 && echo ""
        read -rsp "TAVILY_API_KEY: " TAVILY && echo ""
        read -rsp "FREEPIK_API_KEY: " FREEPIK && echo ""

        set_secret "CLOUDFLARE_API_TOKEN" "$CF_TOKEN"
        set_secret "CLOUDFLARE_ACCOUNT_ID" "$CF_ACCOUNT"
        set_secret "SERPER_API_KEY_1" "$SERPER1"
        set_secret "SERPER_API_KEY_2" "$SERPER2"
        set_secret "TAVILY_API_KEY" "$TAVILY"
        set_secret "FREEPIK_API_KEY" "$FREEPIK"
        ;;
    2)
        echo ""
        echo "Reading from environment variables..."
        set_secret "CLOUDFLARE_API_TOKEN" "${CLOUDFLARE_API_TOKEN:-}"
        set_secret "CLOUDFLARE_ACCOUNT_ID" "${CLOUDFLARE_ACCOUNT_ID:-}"
        set_secret "SERPER_API_KEY_1" "${SERPER_API_KEY_1:-}"
        set_secret "SERPER_API_KEY_2" "${SERPER_API_KEY_2:-}"
        set_secret "TAVILY_API_KEY" "${TAVILY_API_KEY:-}"
        set_secret "FREEPIK_API_KEY" "${FREEPIK_API_KEY:-}"
        ;;
    3)
        echo ""
        echo "Dry run — showing commands:"
        echo ""
        for secret in "${SECRETS[@]}"; do
            echo "  echo \"<value>\" | gh secret set $secret --repo $REPO"
        done
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup complete!"
echo ""
echo "  Verify secrets:"
echo "    gh secret list --repo $REPO"
echo ""
echo "  Trigger a manual deploy:"
echo "    gh workflow run fetch-and-deploy.yml --repo $REPO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
