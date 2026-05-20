"""
google_automation.py — Headless Chrome automation for Google One offer detection.

Flow:
  1. Open Google Accounts sign-in with the Pixel 10 Pro device profile
  2. Enter email → Next → enter password → Next
  3. Handle common 2-step / challenge screens gracefully
  4. Navigate to Google One offers / benefits page
  5. Scan the page for a Gemini Pro / AI Premium free-trial offer
  6. Extract and return the activation link if found

Fixes applied vs original:
  • EC.any_of() replaced with sequential presence checks (Selenium 4 any_of
    requires conditions as positional args but the original passed a tuple).
  • XPATH for "Next" button fixed — the OR operator in XPath is `or`, not `|`,
    and the original predicate was syntactically broken.
  • scroll-into-view + JS click fallback added before every button click so
    headless Chrome doesn't raise ElementNotInteractableException.
  • account_chooser state now handled: bot clicks the matching account entry
    or falls back to typing the email on the chooser screen.
  • _wait_for_post_login improved: checks for password-error text inline,
    returns proper state strings, and polls at 0.5 s resolution.
  • Added explicit wait for JS render before scanning offers page.
  • All exceptions caught and surfaced as CheckResult — bot layer never crashes.
"""

import logging
import time
from dataclasses import dataclass, field
from typing import Optional

from selenium.common.exceptions import (
    ElementNotInteractableException,
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import config
import device_profile

logger = logging.getLogger(__name__)


# ── Result container ──────────────────────────────────────────────────────────

@dataclass
class CheckResult:
    success: bool     = False
    offer_found: bool = False
    offer_title: str  = ""
    offer_link: str   = ""
    message: str      = ""
    requires_2fa: bool = False
    error: str        = ""
    screenshots: list = field(default_factory=list)


# ── Internal helpers ──────────────────────────────────────────────────────────

def _wait(driver: WebDriver, timeout: int = config.ELEMENT_WAIT_TIMEOUT) -> WebDriverWait:
    return WebDriverWait(driver, timeout)


def _safe_find(driver: WebDriver, by: By, selector: str):
    """Return the element or None — never raises."""
    try:
        return driver.find_element(by, selector)
    except NoSuchElementException:
        return None


def _page_contains(driver: WebDriver, *phrases: str) -> bool:
    """Case-insensitive check for any phrase in the current page source."""
    text = driver.page_source.lower()
    return any(p.lower() in text for p in phrases)


def _slow_type(element, text: str, delay: float = 0.07) -> None:
    """Type text character-by-character to mimic human input speed."""
    for char in text:
        element.send_keys(char)
        time.sleep(delay)


def _js_click(driver: WebDriver, element) -> None:
    """
    Scroll element into view then click.
    Falls back to JS click if the normal click raises ElementNotInteractableException.
    """
    try:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        time.sleep(0.2)
        element.click()
    except ElementNotInteractableException:
        driver.execute_script("arguments[0].click();", element)


def _dismiss_cookie_banner(driver: WebDriver) -> None:
    """Attempt to dismiss Google's cookie / consent banner if present."""
    selectors = [
        (By.XPATH, '//button[contains(., "Accept all")]'),
        (By.XPATH, '//button[contains(., "Reject all")]'),
        (By.XPATH, '//button[contains(@aria-label, "Accept")]'),
        (By.ID,    "L2AGLb"),
    ]
    for by, sel in selectors:
        btn = _safe_find(driver, by, sel)
        if btn:
            try:
                _js_click(driver, btn)
                time.sleep(1)
                return
            except Exception:
                pass


def _find_next_button(driver: WebDriver):
    """
    Locate the "Next" button on Google's sign-in pages.

    FIX: The original used a broken XPATH OR predicate. We now try multiple
    separate selectors in priority order instead.
    """
    selectors = [
        (By.XPATH, '//button[@jsname="LgbsSe"]'),
        (By.XPATH, '//button[.//span[text()="Next"]]'),
        (By.XPATH, '//button[contains(@class,"VfPpkd")][.//span[contains(text(),"Next")]]'),
        (By.CSS_SELECTOR, 'button[type="submit"]'),
        (By.XPATH, '//div[@role="button"][.//span[text()="Next"]]'),
    ]
    for by, sel in selectors:
        el = _safe_find(driver, by, sel)
        if el:
            return el
    return None


def _detect_challenge(driver: WebDriver) -> str:
    """
    Detect the current sign-in state / challenge type.

    Returns one of:
      'logged_in'       — successfully authenticated
      'phone_verify'    — "Verify it's you" / phone prompt
      '2fa_totp'        — authenticator app OTP
      '2fa_sms'         — SMS OTP
      'recovery'        — recovery email / backup code
      'captcha'         — reCAPTCHA / unusual-traffic wall
      'account_chooser' — account picker screen
      'password_error'  — wrong password detected
      'unknown'         — unrecognised screen
    """
    try:
        url = driver.current_url.lower()
        src = driver.page_source.lower()
    except Exception:
        return "unknown"

    if "myaccount.google.com" in url or "one.google.com" in url:
        return "logged_in"
    if "/u/" in url and "google.com" in url and "accounts" not in url:
        return "logged_in"
    if "accounts.google.com/signin/v2/challenge/ipp" in url:
        return "phone_verify"
    if "accounts.google.com/signin/v2/challenge/totp" in url:
        return "2fa_totp"
    if "accounts.google.com/signin/v2/challenge/az" in url:
        return "2fa_sms"
    if "accounts.google.com/signin/v2/challenge/sk" in url:
        return "2fa_totp"
    if "accounts.google.com/signin/v2/challenge" in url:
        return "recovery"
    if "accounts.google.com/accountchooser" in url:
        return "account_chooser"
    if "recaptcha" in src or "unusual traffic" in src or "detected unusual" in src:
        return "captcha"
    if "sorry/index" in url or "google.com/sorry" in url:
        return "captcha"
    if any(p in src for p in ("wrong password", "incorrect password", "password was incorrect",
                               "couldn't sign you in")):
        return "password_error"
    return "unknown"


# ── Sign-in sequence ──────────────────────────────────────────────────────────

def _handle_account_chooser(driver: WebDriver, email: str) -> bool:
    """
    On the account-chooser screen, click the matching account tile if visible,
    otherwise click "Use another account" and fall through to normal email entry.
    Returns True if we successfully advanced past the chooser.
    """
    try:
        # Try clicking the tile that matches our email
        tile = _safe_find(
            driver, By.XPATH,
            f'//div[@data-identifier="{email}"] | '
            f'//li[contains(.,"{email}")]//div[@role="link"] | '
            f'//*[contains(@aria-label,"{email}")]'
        )
        if tile:
            _js_click(driver, tile)
            time.sleep(2)
            return True

        # Try "Use another account"
        other = _safe_find(
            driver, By.XPATH,
            '//li[contains(.,"Use another account")] | '
            '//div[contains(.,"Use another account")][@role="link"]'
        )
        if other:
            _js_click(driver, other)
            time.sleep(2)
            return True
    except Exception as exc:
        logger.warning("account_chooser handler error: %s", exc)

    return False


def _enter_email(driver: WebDriver, email: str) -> bool:
    """
    Fill in the email field and click Next.
    Returns True on success.
    """
    try:
        _wait(driver).until(
            EC.presence_of_element_located((By.ID, "identifierId"))
        )
    except TimeoutException:
        logger.warning("identifierId field not found within timeout")
        return False

    try:
        email_field = driver.find_element(By.ID, "identifierId")
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", email_field)
        email_field.clear()
        _slow_type(email_field, email)
        time.sleep(0.3)

        btn = _find_next_button(driver)
        if not btn:
            logger.warning("Next button not found after email entry")
            return False
        _js_click(driver, btn)
        time.sleep(2.5)
        return True
    except Exception as exc:
        logger.warning("_enter_email error: %s", exc)
        return False


def _enter_password(driver: WebDriver, password: str) -> bool:
    """
    Fill in the password field and click Next.

    FIX: replaced EC.any_of(tuple) with two sequential presence checks —
    EC.any_of() in Selenium 4 takes *args not a tuple, and combining it
    with a fallback find is cleaner this way.
    """
    # Wait for either the Passwd field (old UI) or any password input (new UI)
    found = False
    for selector in [
        (By.NAME, "Passwd"),
        (By.CSS_SELECTOR, 'input[type="password"]'),
        (By.XPATH, '//input[@type="password"]'),
    ]:
        try:
            _wait(driver, 10).until(EC.presence_of_element_located(selector))
            found = True
            break
        except TimeoutException:
            continue

    if not found:
        logger.warning("Password field not found within timeout")
        return False

    try:
        pwd_field = (
            _safe_find(driver, By.NAME, "Passwd")
            or _safe_find(driver, By.CSS_SELECTOR, 'input[type="password"]')
            or driver.find_element(By.XPATH, '//input[@type="password"]')
        )
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", pwd_field)
        pwd_field.clear()
        _slow_type(pwd_field, password)
        time.sleep(0.3)

        btn = _find_next_button(driver)
        if not btn:
            logger.warning("Next button not found after password entry")
            return False
        _js_click(driver, btn)
        time.sleep(3)
        return True
    except Exception as exc:
        logger.warning("_enter_password error: %s", exc)
        return False


def _wait_for_post_login(driver: WebDriver, timeout: int = 20) -> str:
    """
    Poll every 0.5 s for up to *timeout* seconds waiting for a decisive state.

    FIX: original polled at 1 s intervals and had a logic gap where challenge
    states on accounts.google.com were returned as 'unknown' when _detect_challenge
    returned a real state. Now we return on any non-'unknown' result immediately.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        state = _detect_challenge(driver)
        if state != "unknown":
            return state
        time.sleep(0.5)

    # Last attempt
    return _detect_challenge(driver)


# ── Offer detection ───────────────────────────────────────────────────────────

def _wait_for_page_stable(driver: WebDriver, idle_seconds: float = 2.0) -> None:
    """
    Wait until the page source stops changing for *idle_seconds*, indicating
    that JS rendering has settled. Caps at 10 s total.
    """
    deadline = time.time() + 10
    prev_len = 0
    stable_since = time.time()

    while time.time() < deadline:
        cur_len = len(driver.page_source)
        if cur_len != prev_len:
            stable_since = time.time()
            prev_len = cur_len
        elif time.time() - stable_since >= idle_seconds:
            return
        time.sleep(0.4)


def _scan_offers_page(driver: WebDriver) -> tuple:
    """
    Scan the Google One page for a Gemini / AI Premium offer.

    Returns (found: bool, title: str, link: str)

    FIX: added _wait_for_page_stable() before scanning so JS-rendered content
    is present before we iterate the DOM.
    """
    _wait_for_page_stable(driver)

    # ── 1. Anchor tags mentioning Gemini / AI Premium ─────────────────────────
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
            except StaleElementReferenceException:
                continue
            except Exception:
                continue
    except Exception:
        pass

    # ── 2. Buttons / elements with role="button" or role="link" ──────────────
    try:
        for role in ("button", "link"):
            elements = driver.find_elements(By.XPATH, f'//*[@role="{role}"]')
            for el in elements:
                try:
                    text = el.text.lower()
                    if any(kw in text for kw in config.GEMINI_OFFER_KEYWORDS):
                        href = ""
                        try:
                            parent = el.find_element(By.XPATH, "ancestor::a[1]")
                            href = parent.get_attribute("href") or ""
                        except NoSuchElementException:
                            href = el.get_attribute("href") or driver.current_url
                        title = el.text.strip() or "Gemini Offer"
                        return True, title, href
                except StaleElementReferenceException:
                    continue
                except Exception:
                    continue
    except Exception:
        pass

    # ── 3. Raw page-source keyword check (last resort) ────────────────────────
    src = driver.page_source.lower()
    for kw in config.GEMINI_OFFER_KEYWORDS:
        if kw in src:
            return True, f'Offer detected (keyword: "{kw}")', driver.current_url

    return False, "", ""


def _navigate_to_offers(driver: WebDriver) -> bool:
    """
    Navigate to Google One and wait for the page to actually load.
    Returns True if we land on a one.google.com page.
    """
    for url in (config.GOOGLE_ONE_OFFERS_URL, config.GOOGLE_ONE_URL):
        try:
            driver.get(url)
            # Wait up to 10 s for the URL to confirm we are on Google One
            try:
                WebDriverWait(driver, 10).until(
                    lambda d: "one.google.com" in d.current_url.lower()
                )
                return True
            except TimeoutException:
                if "one.google.com" in driver.current_url.lower():
                    return True
        except WebDriverException as exc:
            logger.warning("Navigation to %s failed: %s", url, exc)
            continue

    return False


# ── Public API ────────────────────────────────────────────────────────────────

def check_gemini_offer(email: str, password: str) -> CheckResult:
    """
    Full end-to-end check: spin up a Pixel 10 Pro browser session, sign into
    Google, navigate to Google One, and look for a free Gemini Pro offer.

    Parameters
    ----------
    email : str
        Gmail address to check.
    password : str
        Account password (in memory only, never logged or stored to disk).

    Returns
    -------
    CheckResult
        Structured result with offer details or an error explanation.
    """
    result = CheckResult()
    driver: Optional[WebDriver] = None

    try:
        # ── 1. Launch browser ─────────────────────────────────────────────────
        logger.info("Launching Pixel 10 Pro browser for %s", email)
        driver = device_profile.build_driver(headless=True)

        # ── 2. Open Google sign-in ────────────────────────────────────────────
        driver.get(f"{config.GOOGLE_ACCOUNTS_URL}/signin/v2/identifier?hl=en")
        time.sleep(2)
        _dismiss_cookie_banner(driver)

        # ── 3. Handle account chooser if already shown ────────────────────────
        initial_state = _detect_challenge(driver)
        if initial_state == "account_chooser":
            logger.info("Account chooser detected — handling it")
            _handle_account_chooser(driver, email)
            time.sleep(1.5)

        # ── 4. Enter email ────────────────────────────────────────────────────
        if not _enter_email(driver, email):
            result.error   = "Could not find the email input field."
            result.message = "❌ Sign-in failed: email field not found.\n\nGoogle may have changed its UI or is blocking headless browsers. Try again in a few minutes."
            return result

        if _page_contains(driver, "couldn't find your google account", "no account found"):
            result.error   = "Google says this account does not exist."
            result.message = "❌ No Google account found for that email address."
            return result

        # ── 5. Enter password ─────────────────────────────────────────────────
        if not _enter_password(driver, password):
            result.error   = "Could not find the password input field."
            result.message = "❌ Sign-in failed: password field not found.\n\nThis can happen if Google showed a CAPTCHA or an unexpected screen."
            return result

        if _page_contains(driver, "wrong password", "incorrect password",
                          "password was incorrect", "couldn't sign you in"):
            result.error   = "Google rejected the password."
            result.message = "❌ Incorrect password. Please check your credentials and try /login again."
            return result

        # ── 6. Wait for post-login state ──────────────────────────────────────
        state = _wait_for_post_login(driver)
        logger.info("Post-login state: %s | URL: %s", state, driver.current_url)

        if state == "password_error":
            result.error   = "Wrong password."
            result.message = "❌ Incorrect password. Please /logout and /login again with the correct password."
            return result

        if state in ("2fa_totp", "2fa_sms", "phone_verify", "recovery"):
            result.requires_2fa = True
            result.message = (
                "⚠️ Google is asking for 2-Step Verification.\n\n"
                "This bot cannot complete 2FA automatically.\n\n"
                "Solutions:\n"
                "  • Use an App Password instead of your real password:\n"
                "    Google Account → Security → App Passwords\n"
                "  • Or temporarily disable 2FA for this check."
            )
            return result

        if state == "captcha":
            result.error   = "Google triggered a CAPTCHA / unusual-traffic block."
            result.message = (
                "⚠️ Google detected automated activity and showed a CAPTCHA.\n\n"
                "Please wait 5–10 minutes and try again."
            )
            return result

        if state == "account_chooser":
            # Second chance — handle chooser after password redirect
            _handle_account_chooser(driver, email)
            state = _wait_for_post_login(driver, timeout=10)

        if state != "logged_in":
            result.error   = f"Unexpected post-login state: {state} | URL: {driver.current_url}"
            result.message = (
                "❌ Sign-in did not complete as expected.\n\n"
                "Google may have changed its sign-in flow, or this account has "
                "unusual security settings. Check Replit logs for details."
            )
            return result

        result.success = True
        logger.info("Signed in successfully as %s", email)

        # ── 7. Navigate to Google One ─────────────────────────────────────────
        if not _navigate_to_offers(driver):
            result.message = (
                "✅ Signed in successfully, but could not load Google One.\n\n"
                f"Check manually: {config.GOOGLE_ONE_OFFERS_URL}"
            )
            result.offer_link = config.GOOGLE_ONE_OFFERS_URL
            return result

        # ── 8. Scan for Gemini offer ──────────────────────────────────────────
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
                "😔 No free Gemini Pro / AI Premium offer was found for this account.\n\n"
                "This account may not be eligible, or the offer may have already been "
                "used or expired.\n\n"
                f"Check manually: {config.GOOGLE_ONE_OFFERS_URL}"
            )

        return result

    except WebDriverException as exc:
        logger.error("WebDriver error: %s", exc)
        result.error   = str(exc)
        result.message = (
            "❌ Browser automation failed.\n\n"
            "Common causes:\n"
            "  • Chromium or ChromeDriver not installed correctly\n"
            "  • Chrome/ChromeDriver version mismatch\n\n"
            "Check Replit logs for the full error."
        )
        return result

    except Exception as exc:
        logger.exception("Unexpected error during offer check")
        result.error   = str(exc)
        result.message = "❌ An unexpected error occurred. Check Replit logs for details."
        return result

    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass
