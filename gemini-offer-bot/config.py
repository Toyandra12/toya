"""
config.py — Central configuration for the Gemini Offer Telegram Bot
All sensitive values are read from environment variables / Replit Secrets.
"""

import os

# ── Telegram ──────────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "")

# ── Chrome / Selenium ─────────────────────────────────────────────────────────
# Path to chromedriver on Replit (installed via replit.nix)
CHROMEDRIVER_PATH: str = os.environ.get("CHROMEDRIVER_PATH", "/usr/bin/chromedriver")
CHROME_BINARY_PATH: str = os.environ.get("CHROME_BINARY_PATH", "/usr/bin/chromium-browser")

# How long (seconds) to wait for page elements before timing out
PAGE_LOAD_TIMEOUT: int = 30
ELEMENT_WAIT_TIMEOUT: int = 20

# ── Google One URLs ───────────────────────────────────────────────────────────
GOOGLE_ACCOUNTS_URL = "https://accounts.google.com"
GOOGLE_ONE_URL      = "https://one.google.com"
GOOGLE_ONE_OFFERS_URL = "https://one.google.com/u/0/offers"

# ── Session ───────────────────────────────────────────────────────────────────
# Credentials are stored in memory only — never written to disk.
# Structure: { telegram_user_id: { "email": str, "password": str, "offer": dict|None, "status": str } }
USER_SESSIONS: dict = {}

# ── Gemini Pro offer keywords to search for in page text ─────────────────────
GEMINI_OFFER_KEYWORDS = [
    "gemini advanced",
    "gemini pro",
    "google one ai premium",
    "ai premium",
    "try gemini",
    "free gemini",
]

# Selector hints for the Google One offers / benefits page
OFFER_LINK_PATTERNS = [
    "gemini",
    "ai premium",
    "upgrade",
]
