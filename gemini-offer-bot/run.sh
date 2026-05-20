#!/usr/bin/env bash
# run.sh — Startup script for Replit
# Installs deps if needed, auto-detects Chrome/ChromeDriver paths,
# then launches the bot.

set -e

echo "=== Gemini Offer Bot — startup ==="

# ── 1. Install Python dependencies ───────────────────────────────────────────
echo "[1/3] Installing Python dependencies..."
pip install -q -r requirements.txt

# ── 2. Auto-detect Chrome and ChromeDriver if not already set ────────────────
echo "[2/3] Detecting Chrome and ChromeDriver paths..."

if [ -z "$CHROME_BINARY_PATH" ]; then
    for candidate in chromium chromium-browser google-chrome google-chrome-stable; do
        path=$(which "$candidate" 2>/dev/null || true)
        if [ -n "$path" ]; then
            export CHROME_BINARY_PATH="$path"
            echo "  Chrome found: $CHROME_BINARY_PATH"
            break
        fi
    done
else
    echo "  Chrome (from env): $CHROME_BINARY_PATH"
fi

if [ -z "$CHROMEDRIVER_PATH" ]; then
    path=$(which chromedriver 2>/dev/null || true)
    if [ -n "$path" ]; then
        export CHROMEDRIVER_PATH="$path"
        echo "  ChromeDriver found: $CHROMEDRIVER_PATH"
    else
        echo "  ChromeDriver not found on PATH — webdriver-manager will download it"
    fi
else
    echo "  ChromeDriver (from env): $CHROMEDRIVER_PATH"
fi

# ── 3. Launch the bot ─────────────────────────────────────────────────────────
echo "[3/3] Starting bot..."
exec python bot.py
