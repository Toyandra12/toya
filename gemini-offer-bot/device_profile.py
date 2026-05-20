"""
device_profile.py — Simulates a Pixel 10 Pro running Android 16 (Chrome 136)
Each call to build_chrome_options() returns a fresh, randomised device identity
so every user session looks like a distinct real device to Google's servers.
"""

import random
import string
import uuid

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

import config


# ── Static device fingerprint constants ───────────────────────────────────────

# Chrome 136 on Android 16 / Pixel 10 Pro
_CHROME_VERSION   = "136.0.7103.92"
_ANDROID_VERSION  = "16"
_DEVICE_MODEL     = "Pixel 10 Pro"
_WEBKIT_VERSION   = "537.36"

# Full desktop-style UA that still carries the Android/Pixel token
# (triggers Google's mobile-aware flow without the pure-mobile viewport lock)
USER_AGENT = (
    f"Mozilla/5.0 (Linux; Android {_ANDROID_VERSION}; {_DEVICE_MODEL} Build/BP1A.250505.002; wv) "
    f"AppleWebKit/{_WEBKIT_VERSION} (KHTML, like Gecko) "
    f"Chrome/{_CHROME_VERSION} Mobile Safari/{_WEBKIT_VERSION}"
)

# Sec-CH-UA values matching Chrome 136
SEC_CH_UA = (
    '"Chromium";v="136", "Google Chrome";v="136", "Not-A.Brand";v="99"'
)
SEC_CH_UA_MOBILE   = "?1"
SEC_CH_UA_PLATFORM = '"Android"'

# Screen / viewport — Pixel 10 Pro logical resolution (412 × 915 dp)
VIEWPORT_WIDTH  = 412
VIEWPORT_HEIGHT = 915

# Pixel density
DEVICE_PIXEL_RATIO = 3.5


# ── Helpers ───────────────────────────────────────────────────────────────────

def _random_device_id() -> str:
    """Return a random 16-char hex string that mimics an Android device ID."""
    return uuid.uuid4().hex[:16].upper()


def _random_mac() -> str:
    """Generate a random MAC address (used only in the JS fingerprint override)."""
    return ":".join(
        "".join(random.choices("0123456789ABCDEF", k=2)) for _ in range(6)
    )


def _random_screen_noise() -> int:
    """Small ±2 px noise on viewport to avoid a static fingerprint."""
    return random.randint(-2, 2)


# ── Chrome options builder ────────────────────────────────────────────────────

def build_chrome_options(headless: bool = True) -> Options:
    """
    Return a configured ChromeOptions object that impersonates a
    Pixel 10 Pro (Android 16) device with a fresh random identity.

    Parameters
    ----------
    headless : bool
        Run Chrome without a visible window (True for server / Replit use).
    """
    options = Options()

    # ── Headless mode ─────────────────────────────────────────────────────────
    if headless:
        options.add_argument("--headless=new")          # Chrome 112+ headless
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")            # Required in Replit/Docker
        options.add_argument("--disable-dev-shm-usage") # Avoid /dev/shm OOM

    # ── Binary path (set in config) ────────────────────────────────────────
    if config.CHROME_BINARY_PATH:
        options.binary_location = config.CHROME_BINARY_PATH

    # ── Window / viewport ─────────────────────────────────────────────────────
    w = VIEWPORT_WIDTH  + _random_screen_noise()
    h = VIEWPORT_HEIGHT + _random_screen_noise()
    options.add_argument(f"--window-size={w},{h}")

    # ── User-Agent ────────────────────────────────────────────────────────────
    options.add_argument(f"--user-agent={USER_AGENT}")

    # ── Privacy / anti-detection flags ────────────────────────────────────────
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    # ── Performance / stability ───────────────────────────────────────────────
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--disable-web-security")
    options.add_argument("--lang=en-US")
    options.add_argument("--accept-lang=en-US,en;q=0.9")

    # Fresh profile dir per session (temp dir handled by Selenium automatically)
    options.add_argument("--incognito")

    # Mobile emulation metadata (used alongside the UA for a consistent profile)
    mobile_emulation = {
        "deviceMetrics": {
            "width":         w,
            "height":        h,
            "pixelRatio":    DEVICE_PIXEL_RATIO,
            "touch":         True,
        },
        "userAgent": USER_AGENT,
        "clientHints": {
            "platform":        "Android",
            "mobile":          True,
        },
    }
    options.add_experimental_option("mobileEmulation", mobile_emulation)

    return options


def build_driver(headless: bool = True) -> webdriver.Chrome:
    """
    Instantiate and return a Chrome WebDriver with the Pixel 10 Pro profile,
    then inject JS overrides to mask navigator.webdriver and spoof screen info.

    Parameters
    ----------
    headless : bool
        Whether to run in headless mode.

    Returns
    -------
    webdriver.Chrome
        A ready-to-use driver instance.
    """
    options = build_chrome_options(headless=headless)
    service = Service(executable_path=config.CHROMEDRIVER_PATH)
    driver  = webdriver.Chrome(service=service, options=options)

    # ── JS fingerprint overrides ──────────────────────────────────────────────
    device_id = _random_device_id()
    mac       = _random_mac()

    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": f"""
                // Hide webdriver flag
                Object.defineProperty(navigator, 'webdriver', {{
                    get: () => undefined
                }});

                // Spoof platform
                Object.defineProperty(navigator, 'platform', {{
                    get: () => 'Linux aarch64'
                }});

                // Spoof app version
                Object.defineProperty(navigator, 'appVersion', {{
                    get: () => '5.0 (Linux; Android {_ANDROID_VERSION}; {_DEVICE_MODEL})'
                }});

                // Spoof hardware concurrency (Tensor G5 = 8 cores)
                Object.defineProperty(navigator, 'hardwareConcurrency', {{
                    get: () => 8
                }});

                // Spoof device memory (12 GB)
                Object.defineProperty(navigator, 'deviceMemory', {{
                    get: () => 12
                }});

                // Spoof screen dimensions
                Object.defineProperty(screen, 'width',       {{ get: () => {VIEWPORT_WIDTH} }});
                Object.defineProperty(screen, 'height',      {{ get: () => {VIEWPORT_HEIGHT} }});
                Object.defineProperty(screen, 'availWidth',  {{ get: () => {VIEWPORT_WIDTH} }});
                Object.defineProperty(screen, 'availHeight', {{ get: () => {VIEWPORT_HEIGHT - 48} }});
                Object.defineProperty(window, 'devicePixelRatio', {{ get: () => {DEVICE_PIXEL_RATIO} }});

                // Unique device fingerprint seed (changes per session)
                window.__deviceId = '{device_id}';
                window.__macAddr  = '{mac}';

                // Suppress chrome automation objects
                window.chrome = {{
                    runtime: {{}},
                    loadTimes: function() {{}},
                    csi: function() {{}},
                    app: {{}}
                }};

                // Sec-CH-UA headers (for fetch/XHR)
                Object.defineProperty(navigator, 'userAgentData', {{
                    get: () => ({{
                        brands: [
                            {{ brand: 'Chromium',       version: '136' }},
                            {{ brand: 'Google Chrome',  version: '136' }},
                            {{ brand: 'Not-A.Brand',    version: '99'  }}
                        ],
                        mobile: true,
                        platform: 'Android',
                        getHighEntropyValues: (hints) => Promise.resolve({{
                            platform:        'Android',
                            platformVersion: '{_ANDROID_VERSION}',
                            architecture:    'arm',
                            model:           '{_DEVICE_MODEL}',
                            uaFullVersion:   '{_CHROME_VERSION}',
                            mobile:          true
                        }})
                    }})
                }});
            """
        },
    )

    # Timeouts
    driver.set_page_load_timeout(config.PAGE_LOAD_TIMEOUT)
    driver.implicitly_wait(2)

    return driver
