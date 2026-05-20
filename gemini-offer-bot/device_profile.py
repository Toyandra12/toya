"""
device_profile.py — Simulates a Pixel 10 Pro running Android 16 (Chrome 136)

Fixes applied vs original:
  • Removed duplicate --user-agent argument (mobileEmulation already sets it;
    having both causes Chrome to ignore the emulation UA).
  • Removed --incognito: it conflicts with mobileEmulation experimental option
    and causes Chrome to silently drop the mobile profile.
  • Removed --disable-web-security: breaks Google's CORS-based login flow.
  • Replaced driver.implicitly_wait() with explicit waits only — mixing both
    causes unpredictable timeout races in Selenium 4.
  • Added --remote-debugging-port=0 so CDP commands work reliably in headless.
  • Added --disable-background-networking and similar flags to reduce Google's
    bot-detection surface.
"""

import random
import uuid

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

import config


# ── Static device fingerprint constants ───────────────────────────────────────

_CHROME_VERSION  = "136.0.7103.92"
_ANDROID_VERSION = "16"
_DEVICE_MODEL    = "Pixel 10 Pro"
_BUILD_ID        = "BP1A.250505.002"
_WEBKIT_VERSION  = "537.36"

USER_AGENT = (
    f"Mozilla/5.0 (Linux; Android {_ANDROID_VERSION}; {_DEVICE_MODEL} "
    f"Build/{_BUILD_ID}; wv) "
    f"AppleWebKit/{_WEBKIT_VERSION} (KHTML, like Gecko) "
    f"Chrome/{_CHROME_VERSION} Mobile Safari/{_WEBKIT_VERSION}"
)

# Pixel 10 Pro logical resolution (412 × 915 dp)
VIEWPORT_WIDTH     = 412
VIEWPORT_HEIGHT    = 915
DEVICE_PIXEL_RATIO = 3.5


# ── Helpers ───────────────────────────────────────────────────────────────────

def _random_device_id() -> str:
    return uuid.uuid4().hex[:16].upper()


def _random_mac() -> str:
    return ":".join(
        "".join(random.choices("0123456789ABCDEF", k=2)) for _ in range(6)
    )


def _random_screen_noise() -> int:
    """±2 px noise so every session has a slightly different viewport."""
    return random.randint(-2, 2)


# ── Chrome options builder ────────────────────────────────────────────────────

def build_chrome_options(headless: bool = True) -> Options:
    """
    Return ChromeOptions that impersonate a Pixel 10 Pro (Android 16) device
    with a fresh random identity on every call.
    """
    options = Options()

    # ── Headless ──────────────────────────────────────────────────────────────
    if headless:
        options.add_argument("--headless=new")       # Chrome 112+ headless API
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")         # required in Replit/Docker
        options.add_argument("--disable-dev-shm-usage")  # avoid /dev/shm OOM

    # ── Binary path ───────────────────────────────────────────────────────────
    if config.CHROME_BINARY_PATH:
        options.binary_location = config.CHROME_BINARY_PATH

    # ── Viewport ──────────────────────────────────────────────────────────────
    w = VIEWPORT_WIDTH  + _random_screen_noise()
    h = VIEWPORT_HEIGHT + _random_screen_noise()
    options.add_argument(f"--window-size={w},{h}")

    # ── Anti-detection ────────────────────────────────────────────────────────
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    # ── Stability / performance ───────────────────────────────────────────────
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-sync")
    options.add_argument("--metrics-recording-only")
    options.add_argument("--no-first-run")
    options.add_argument("--safebrowsing-disable-auto-update")
    options.add_argument("--lang=en-US")
    # NOTE: --remote-debugging-port=0 lets Chrome pick a free port so CDP works
    options.add_argument("--remote-debugging-port=0")

    # FIX: --incognito is intentionally NOT set — it conflicts with
    # mobileEmulation and causes Chrome to silently drop the mobile UA profile.

    # FIX: --disable-web-security is intentionally NOT set — it breaks
    # Google's CORS-based sign-in flow and causes login failures.

    # ── Mobile emulation ──────────────────────────────────────────────────────
    # NOTE: mobileEmulation sets the User-Agent internally; do NOT also pass
    # --user-agent or the two conflict and Google gets a mangled UA string.
    mobile_emulation = {
        "deviceMetrics": {
            "width":      w,
            "height":     h,
            "pixelRatio": DEVICE_PIXEL_RATIO,
            "touch":      True,
        },
        "userAgent": USER_AGENT,
        "clientHints": {
            "platform": "Android",
            "mobile":   True,
        },
    }
    options.add_experimental_option("mobileEmulation", mobile_emulation)

    return options


# ── Driver builder ────────────────────────────────────────────────────────────

def build_driver(headless: bool = True) -> webdriver.Chrome:
    """
    Instantiate a Chrome WebDriver with the Pixel 10 Pro profile and inject
    JS overrides to mask navigator.webdriver and spoof hardware/screen info.

    FIX: implicitly_wait() is NOT set here.  Mixing implicit + explicit waits
    in Selenium 4 causes unpredictable races; we use WebDriverWait exclusively
    in google_automation.py instead.
    """
    options = build_chrome_options(headless=headless)

    # Use webdriver-manager as fallback if no chromedriver path is configured
    if config.CHROMEDRIVER_PATH:
        service = Service(executable_path=config.CHROMEDRIVER_PATH)
    else:
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
        except Exception:
            service = Service()  # let Selenium find it on PATH

    driver = webdriver.Chrome(service=service, options=options)
    driver.set_page_load_timeout(config.PAGE_LOAD_TIMEOUT)

    # ── JS fingerprint overrides (injected before every page load) ────────────
    device_id = _random_device_id()
    mac       = _random_mac()

    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": f"""
                // 1. Hide webdriver flag
                Object.defineProperty(navigator, 'webdriver', {{
                    get: () => undefined
                }});

                // 2. Spoof platform
                Object.defineProperty(navigator, 'platform', {{
                    get: () => 'Linux aarch64'
                }});

                // 3. Spoof appVersion
                Object.defineProperty(navigator, 'appVersion', {{
                    get: () => '5.0 (Linux; Android {_ANDROID_VERSION}; {_DEVICE_MODEL})'
                }});

                // 4. Tensor G5 = 8 cores
                Object.defineProperty(navigator, 'hardwareConcurrency', {{
                    get: () => 8
                }});

                // 5. 12 GB RAM
                Object.defineProperty(navigator, 'deviceMemory', {{
                    get: () => 12
                }});

                // 6. Screen dimensions
                Object.defineProperty(screen, 'width',       {{ get: () => {VIEWPORT_WIDTH} }});
                Object.defineProperty(screen, 'height',      {{ get: () => {VIEWPORT_HEIGHT} }});
                Object.defineProperty(screen, 'availWidth',  {{ get: () => {VIEWPORT_WIDTH} }});
                Object.defineProperty(screen, 'availHeight', {{ get: () => {VIEWPORT_HEIGHT - 48} }});
                Object.defineProperty(window, 'devicePixelRatio', {{ get: () => {DEVICE_PIXEL_RATIO} }});

                // 7. Unique device seed per session
                window.__deviceId = '{device_id}';
                window.__macAddr  = '{mac}';

                // 8. Chrome runtime stub (prevents "chrome is not defined" errors)
                window.chrome = {{
                    runtime: {{}},
                    loadTimes: function() {{ return {{}}; }},
                    csi: function() {{ return {{}}; }},
                    app: {{}}
                }};

                // 9. userAgentData / Sec-CH-UA
                Object.defineProperty(navigator, 'userAgentData', {{
                    get: () => ({{
                        brands: [
                            {{ brand: 'Chromium',      version: '136' }},
                            {{ brand: 'Google Chrome', version: '136' }},
                            {{ brand: 'Not-A.Brand',   version: '99'  }}
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

                // 10. Permissions API stub (prevents fingerprint via denied mic/camera)
                const _origQuery = window.navigator.permissions
                    && window.navigator.permissions.query
                    ? window.navigator.permissions.query.bind(window.navigator.permissions)
                    : null;
                if (_origQuery) {{
                    window.navigator.permissions.query = (parameters) =>
                        parameters.name === 'notifications'
                            ? Promise.resolve({{ state: Notification.permission }})
                            : _origQuery(parameters);
                }}
            """
        },
    )

    return driver
