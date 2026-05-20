"""
config.py — Central configuration for the Gemini Offer Telegram Bot
All sensitive values are read from environment variables / Replit Secrets.

Chrome/ChromeDriver paths are auto-detected via shutil.which so the bot
works on Replit out of the box without any manual path configuration.
"""

import os
import shutil

# ── Telegram ──────────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "")

# ── Chrome / Selenium — auto-detect with env override ────────────────────────
def _find_chrome() -> str:
    """
    Return the path to the Chromium/Chrome binary.
    Checks env var first, then searches common locations via shutil.which.
    """
    env_val = os.environ.get("CHROME_BINARY_PATH", "").strip()
    if env_val and os.path.isfile(env_val):
        return env_val

    candidates = [
        "chromium",
        "chromium-browser",
        "google-chrome",
        "google-chrome-stable",
        "chrome",
    ]
    for name in candidates:
        path = shutil.which(name)
        if path:
            return path

    # Last-resort hard-coded fallbacks (Replit / Debian / Ubuntu)
    hard = [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/nix/store",  # detected dynamically by the launcher
    ]
    for p in hard:
        if os.path.isfile(p):
            return p

    return ""  # caller will raise a clear error


def _find_chromedriver() -> str:
    """
    Return the path to chromedriver.
    Checks env var first, then shutil.which.
    """
    env_val = os.environ.get("CHROMEDRIVER_PATH", "").strip()
    if env_val and os.path.isfile(env_val):
        return env_val

    path = shutil.which("chromedriver")
    if path:
        return path

    hard = [
        "/usr/bin/chromedriver",
        "/usr/local/bin/chromedriver",
    ]
    for p in hard:
        if os.path.isfile(p):
            return p

    return ""  # webdriver-manager will download it as fallback


CHROME_BINARY_PATH: str  = _find_chrome()
CHROMEDRIVER_PATH: str   = _find_chromedriver()

# How long (seconds) to wait for page elements before timing out
PAGE_LOAD_TIMEOUT: int    = 30
ELEMENT_WAIT_TIMEOUT: int = 20

# ── Google One URLs ───────────────────────────────────────────────────────────
GOOGLE_ACCOUNTS_URL   = "https://accounts.google.com"
GOOGLE_ONE_URL        = "https://one.google.com"
GOOGLE_ONE_OFFERS_URL = "https://one.google.com/u/0/offers"

# ── Session ───────────────────────────────────────────────────────────────────
# Credentials are stored in memory only — never written to disk.
# Structure: { telegram_user_id: { "email": str, "password": str,
#                                  "offer": CheckResult|None, "status": str } }
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
