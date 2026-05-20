"""
google_automation.py — Headless Chrome automation for Google One offer detection.

Flow:
  1. Open Google Accounts sign-in with the Pixel 10 Pro device profile
  2. Enter email → Next → enter password → Next
  3. Handle common 2-step / challenge screens gracefully
  4. Navigate to Google One offers / benefits page
  5. Scan the page for a Gemini Pro / AI Premium free-trial offer
  6. Extract and return the activation link if found

All exceptions are caught and surfaced as structured CheckResult dicts so the
Telegram bot layer never crashes from automation errors.
"""

import logging
import time
from dataclasses import dataclass, field
from typing import Optional

from selenium.common.exceptions import (
    ElementNotInteractableException,
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import config
import device_profile

logger = logging.getLogger(__name__)


# ── Result container ──────────────────────────────────────────────────────────

@dataclass
class CheckResult:
    success: bool = False
    offer_found: bool = False
    offer_title: str = ""
    offer_link: str = ""
    message: str = ""
    requires_2fa: bool = False
    error: str = ""
    screenshots: list = field(default_factory=list)  # base64 strings, optional


# ── Internal helpers ──────────────────────────────────────────────────────────

def _wait(driver: WebDriver, timeout: int = config.ELEMENT_WAIT_TIMEOUT) -> WebDriverWait:
    return WebDriverWait(driver, timeout)


def _safe_find(driver: WebDriver, by: By, selector: str) -> Optional[object]:
    """Return the element or None — never raises."""
    try:
        return driver.find_element(by, selector)
    except NoSuchElementException:
        return None


def _page_contains(driver: WebDriver, *phrases: str) -> bool:
    """Case-insensitive check for any of *phrases in the current page source."""
    text = driver.page_source.lower()
    return any(p.lower() in text for p in phrases)


def _slow_type(element, text: str, delay: float = 0.08) -> None:
    """Type text character-by-character to mimic human input speed."""
    for char in text:
        element.send_keys(char)
        time.sleep(delay)


def _dismiss_cookie_banner(driver: WebDriver) -> None:
    """Attempt to dismiss Google's cookie / consent banner if present."""
    selectors = [
        (By.XPATH, '//button[contains(., "Accept all")]'),
        (By.XPATH, '//button[contains(., "Reject all")]'),
        (By.XPATH, '//button[contains(@aria-label, "Accept")]'),
        (By.ID,    "L2AGLb"),   # "Accept all" button ID (common)
    ]
    for by, sel in selectors:
        btn = _safe_find(driver, by, sel)
        if btn:
            try:
                btn.click()
                time.sleep(1)
                return
            except Exception:
                pass


def _detect_challenge(driver: WebDriver) -> str:
    """
    Detect what kind of sign-in challenge / wall Google is showing.

    Returns one of:
      'phone_verify'  — "Verify it's you" / phone number verification
      'recovery'      — recovery email / backup code prompt
      '2fa_totp'      — authenticator app OTP
      '2fa_sms'       — SMS OTP
      'captcha'       — reCAPTCHA / unusual traffic
      'account_chooser' — account picker (already signed-in accounts)
      'logged_in'     — no challenge, user appears to be on an authenticated page
      'unknown'       — unrecognised screen
    """
    src = driver.page_source.lower()
    url = driver.current_url.lower()

    if "myaccount.google.com" in url or "one.google.com" in url:
        return "logged_in"
    if "accounts.google.com/signin/v2/challenge/ipp" in url:
        return "phone_verify"
    if "accounts.google.com/signin/v2/challenge/totp" in url:
        return "2fa_totp"
    if "accounts.google.com/signin/v2/challenge/az" in url:
        return "2fa_sms"
    if "accounts.google.com/signin/v2/challenge" in url:
        return "recovery"
    if "recaptcha" in src or "unusual traffic" in src:
        return "captcha"
    if "accounts.google.com/accountchooser" in url:
        return "account_chooser"
    if "error" in url or "sorry" in url:
        return "captcha"
    return "unknown"


# ── Sign-in sequence ──────────────────────────────────────────────────────────

def _enter_email(driver: WebDriver, email: str) -> bool:
    """
    Fill in the email field and click Next.
    Returns True on success, False if the field was not found.
    """
    try:
        _wait(driver).until(
            EC.presence_of_element_located((By.ID, "identifierId"))
        )
        email_field = driver.find_element(By.ID, "identifierId")
        email_field.clear()
        _slow_type(email_field, email)
        time.sleep(0.4)

        # Click "Next" button
        next_btn = driver.find_element(
            By.XPATH,
            '//button[.//span[contains(text(),"Next")] or @jsname="LgbsSe"]'
        )
        next_btn.click()
        time.sleep(2)
        return True
    except (NoSuchElementException, TimeoutException) as exc:
        logger.warning("Email field not found: %s", exc)
        return False


def _enter_password(driver: WebDriver, password: str) -> bool:
    """
    Fill in the password field and click Next.
    Returns True on success.
    """
    try:
        _wait(driver).until(
            EC.any_of(
                EC.presence_of_element_located((By.NAME, "Passwd")),
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"]')),
            )
        )
        pwd_field = (
            _safe_find(driver, By.NAME, "Passwd")
            or driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        )
        pwd_field.clear()
        _slow_type(pwd_field, password)
        time.sleep(0.4)

        next_btn = driver.find_element(
            By.XPATH,
            '//button[.//span[contains(text(),"Next")] or @jsname="LgbsSe"]'
        )
        next_btn.click()
        time.sleep(3)
        return True
    except (NoSuchElementException, TimeoutException) as exc:
        logger.warning("Password field not found: %s", exc)
        return False


def _wait_for_post_login(driver: WebDriver, timeout: int = 15) -> str:
    """
    After submitting password, wait up to *timeout* seconds for either
    a successful redirect or a challenge screen, and return the state.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        url = driver.current_url.lower()
        # Successful sign-in destinations
        if (
            "myaccount.google.com" in url
            or "one.google.com" in url
            or "google.com/u/" in url
        ):
            return "logged_in"
        # Still on sign-in / challenge
        if "accounts.google.com" in url:
            challenge = _detect_challenge(driver)
            if challenge != "unknown":
                return challenge
        time.sleep(1)
    return _detect_challenge(driver)


# ── Offer detection ───────────────────────────────────────────────────────────

def _scan_offers_page(driver: WebDriver) -> tuple[bool, str, str]:
    """
    Scan the Google One page for a Gemini / AI Premium offer.

    Returns (found: bool, title: str, link: str)
    """
    time.sleep(3)  # let JS render

    # ── Try to find anchor tags that mention Gemini / AI Premium ─────────────
    try:
        anchors = driver.find_elements(By.TAG_NAME, "a")
        for a in anchors:
            try:
                text = a.text.lower()
                href = a.get_attribute("href") or ""
                combined = text + " " + href.lower()
                if any(kw in combined for kw in config.GEMINI_OFFER_KEYWORDS):
                    title = a.text.strip() or "Gemini / AI Premium Offer"
                    return True, title, href
            except Exception:
                continue
    except Exception:
        pass

    # ── Fallback: scan all clickable elements (buttons, divs with role) ───────
    try:
        for role in ["button", "link"]:
            elements = driver.find_elements(By.XPATH, f'//*[@role="{role}"]')
            for el in elements:
                try:
                    text = el.text.lower()
                    if any(kw in text for kw in config.GEMINI_OFFER_KEYWORDS):
                        # Try to find the nearest parent <a>
                        href = ""
                        try:
                            parent = el.find_element(By.XPATH, "ancestor::a[1]")
                            href = parent.get_attribute("href") or ""
                        except NoSuchElementException:
                            href = el.get_attribute("href") or driver.current_url
                        title = el.text.strip() or "Gemini Offer"
                        return True, title, href
                except Exception:
                    continue
    except Exception:
        pass

    # ── Last resort: raw page-source keyword check ────────────────────────────
    src = driver.page_source.lower()
    for kw in config.GEMINI_OFFER_KEYWORDS:
        if kw in src:
            return True, f'Offer detected (keyword: "{kw}")', driver.current_url

    return False, "", ""


def _navigate_to_offers(driver: WebDriver) -> bool:
    """
    Navigate to the Google One offers/benefits page.
    Returns True if we land on a Google One page.
    """
    for url in [config.GOOGLE_ONE_OFFERS_URL, config.GOOGLE_ONE_URL]:
        try:
            driver.get(url)
            time.sleep(3)
            if "one.google.com" in driver.current_url:
                return True
        except WebDriverException:
            continue
    return False


# ── Public API ────────────────────────────────────────────────────────────────

def check_gemini_offer(email: str, password: str) -> CheckResult:
    """
    Full end-to-end check: spin up a Pixel 10 Pro browser session, sign into
    Google with *email* / *password*, then look for a free Gemini Pro offer
    on Google One.

    Parameters
    ----------
    email : str
        The Gmail address to check.
    password : str
        The account password (used only in memory, never logged or stored).

    Returns
    -------
    CheckResult
        Structured result with offer details or an error explanation.
    """
    result = CheckResult()
    driver: Optional[WebDriver] = None

    try:
        # ── 1. Launch browser ─────────────────────────────────────────────────
        logger.info("Launching Pixel 10 Pro browser profile for %s", email)
        driver = device_profile.build_driver(headless=True)

        # ── 2. Open Google sign-in ────────────────────────────────────────────
        driver.get(f"{config.GOOGLE_ACCOUNTS_URL}/signin/v2/identifier?hl=en")
        time.sleep(2)
        _dismiss_cookie_banner(driver)

        # ── 3. Enter email ────────────────────────────────────────────────────
        if not _enter_email(driver, email):
            result.error   = "Could not find the email input field. Google may have changed its UI."
            result.message = "❌ Sign-in failed: email field not found."
            return result

        # Check for account-doesn't-exist error
        if _page_contains(driver, "couldn't find your google account", "no account found"):
            result.error   = "Google says this account does not exist."
            result.message = "❌ No Google account found for that email address."
            return result

        # ── 4. Enter password ─────────────────────────────────────────────────
        if not _enter_password(driver, password):
            result.error   = "Could not find the password input field."
            result.message = "❌ Sign-in failed: password field not found."
            return result

        # Check for wrong-password error
        if _page_contains(driver, "wrong password", "incorrect password", "password was incorrect"):
            result.error   = "Google rejected the password."
            result.message = "❌ Incorrect password. Please check your credentials."
            return result

        # ── 5. Handle post-login state ────────────────────────────────────────
        state = _wait_for_post_login(driver)
        logger.info("Post-login state: %s", state)

        if state in ("2fa_totp", "2fa_sms", "phone_verify", "recovery"):
            result.requires_2fa = True
            result.success      = False
            result.message = (
                "⚠️ Google is asking for 2-Step Verification.\n\n"
                "This bot cannot complete 2FA automatically.\n"
                "Try:\n"
                "  • Temporarily disable 2FA for this check, OR\n"
                "  • Use an App Password (Google Account → Security → App Passwords)."
            )
            return result

        if state == "captcha":
            result.error   = "Google triggered a CAPTCHA / unusual-traffic block."
            result.message = (
                "⚠️ Google detected automated activity and is showing a CAPTCHA.\n"
                "Wait a few minutes and try again."
            )
            return result

        if state not in ("logged_in",):
            result.error   = f"Unexpected post-login state: {state}"
            result.message = "❌ Sign-in did not complete. Google may have changed its sign-in flow."
            return result

        result.success = True
        logger.info("Successfully signed in as %s", email)

        # ── 6. Navigate to Google One ─────────────────────────────────────────
        if not _navigate_to_offers(driver):
            result.message = (
                "✅ Signed in successfully, but could not load Google One.\n"
                "Try /getlink to open the page manually."
            )
            result.offer_link = config.GOOGLE_ONE_OFFERS_URL
            return result

        # ── 7. Scan for Gemini offer ──────────────────────────────────────────
        found, title, link = _scan_offers_page(driver)

        if found:
            result.offer_found = True
            result.offer_title = title
            result.offer_link  = link or config.GOOGLE_ONE_OFFERS_URL
            result.message = (
                f"🎉 Gemini Pro offer found!\n\n"
                f"📌 {title}\n"
                f"🔗 {result.offer_link}"
            )
        else:
            result.offer_found = False
            result.offer_link  = config.GOOGLE_ONE_OFFERS_URL
            result.message = (
                "😔 No free Gemini Pro / AI Premium offer was found on your Google One page.\n\n"
                "This account may not be eligible, or the offer may have expired.\n"
                f"You can check manually: {config.GOOGLE_ONE_OFFERS_URL}"
            )

        return result

    except WebDriverException as exc:
        logger.error("WebDriver error: %s", exc)
        result.error   = str(exc)
        result.message = "❌ Browser automation failed. Check Replit logs for details."
        return result

    except Exception as exc:
        logger.exception("Unexpected error during offer check")
        result.error   = str(exc)
        result.message = "❌ An unexpected error occurred. Check Replit logs."
        return result

    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass
