# 🤖 Gemini Offer Checker — Telegram Bot

A Telegram bot that checks whether your Google account has the free
**12-month Gemini Pro (AI Premium)** offer via Google One.

It spins up a headless Chromium browser that impersonates a **Pixel 10 Pro
running Android 16**, signs into your Google account, navigates to Google One,
and reports back whether the offer is available — along with the direct
activation link.

---

## 📁 Project Structure

```
gemini-offer-bot/
├── bot.py                # Telegram bot — all commands & conversation flow
├── google_automation.py  # Headless Chrome automation & offer detection
├── device_profile.py     # Pixel 10 Pro / Android 16 browser fingerprint
├── config.py             # Central config (reads from environment secrets)
├── requirements.txt      # Python dependencies
├── replit.nix            # Nix packages (Chromium, ChromeDriver, system libs)
├── .replit               # Replit run configuration
└── README.md             # This file
```

---

## 🚀 Setup on Replit (Step-by-Step)

### Step 1 — Create a new Replit

1. Go to [replit.com](https://replit.com) and click **+ Create Repl**
2. Choose **Python** as the template
3. Give it a name, e.g. `gemini-offer-bot`
4. Click **Create Repl**

---

### Step 2 — Upload the project files

Upload all files from this folder into the root of your Repl:

```
bot.py
google_automation.py
device_profile.py
config.py
requirements.txt
replit.nix
.replit
```

You can drag-and-drop them into the Replit file panel, or use the
**Upload file** button.

---

### Step 3 — Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy the **bot token** you receive (looks like `123456789:ABCdef...`)

---

### Step 4 — Add your Telegram token as a Secret

In your Repl, click the 🔒 **Secrets** tab (padlock icon in the left sidebar):

| Key                  | Value                        |
|----------------------|------------------------------|
| `TELEGRAM_BOT_TOKEN` | `your-bot-token-from-step-3` |

> ⚠️ **Never** paste your token directly into any code file.

---

### Step 5 — Fix ChromeDriver paths (important)

After the Repl loads for the first time, open the **Shell** tab and run:

```bash
which chromium
which chromedriver
```

Copy the output paths and add them as Secrets too:

| Key                  | Example value                  |
|----------------------|--------------------------------|
| `CHROME_BINARY_PATH` | `/nix/store/xxxx.../bin/chromium`  |
| `CHROMEDRIVER_PATH`  | `/nix/store/xxxx.../bin/chromedriver` |

> The exact `/nix/store/...` paths vary per Repl. You must set them from the
> actual `which` output — the placeholder paths in `.replit` are just examples.

---

### Step 6 — Install Python dependencies

In the **Shell** tab run:

```bash
pip install -r requirements.txt
```

Replit may do this automatically on first run, but running it manually
ensures everything is installed before you start the bot.

---

### Step 7 — Run the bot

Click the big ▶ **Run** button (or type `python bot.py` in the Shell).

You should see:

```
Bot is starting — polling for updates…
```

---

## 💬 Using the Bot

Open Telegram and search for your bot by the username you gave it in BotFather.

| Command        | What it does                                               |
|----------------|------------------------------------------------------------|
| `/start`       | Welcome message and command overview                       |
| `/login`       | Enter your Gmail address, then your password               |
| `/checkoffer`  | Run the Google One check (takes 30–60 seconds)             |
| `/getlink`     | Return the saved offer activation link                     |
| `/status`      | Show your current session state                            |
| `/logout`      | Clear your credentials from memory                         |
| `/help`        | Show the command list                                      |

### Typical flow

```
You:  /start
Bot:  👋 Welcome! Here are your commands…

You:  /login
Bot:  📧 Please enter your Gmail address:
You:  yourname@gmail.com
Bot:  ✅ Email saved. Now enter your password:
You:  yourpassword          ← bot deletes this message immediately
Bot:  ✅ Credentials saved in memory. 🗑️ Password message deleted.

You:  /checkoffer
Bot:  🚀 Starting check… ⏳ This may take 30–60 seconds.
Bot:  🎉 Gemini Pro offer found!
      📌 Try Gemini Advanced free for 12 months
      🔗 https://one.google.com/...

You:  /getlink
Bot:  🔗 Tap the link to activate your offer…
```

---

## 🔐 Security & Privacy

| Concern | How it's handled |
|---|---|
| Password storage | Held in a Python dict in RAM only — never written to disk, DB, or logs |
| Password in chat | Deleted from Telegram immediately after the bot reads it |
| Credentials in transit | Sent only to Google's own sign-in page via the headless browser |
| Session isolation | Each Telegram user ID gets a completely separate session dict |
| Bot token | Read from Replit Secrets (env var) — never hard-coded |

---

## ⚠️ 2-Factor Authentication (2FA)

If your Google account has 2FA enabled, the bot will detect the challenge
and tell you it cannot proceed automatically.

**Solution — use an App Password:**

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under **"How you sign in to Google"**, click **2-Step Verification**
3. Scroll to the bottom and click **App passwords**
4. Create a new app password (select **Other** → name it `Gemini Bot`)
5. Use the generated 16-character password in `/login` instead of your
   real password

> App Passwords bypass 2FA for a single app and can be revoked at any time.

---

## 🛠️ Troubleshooting

### Bot doesn't start
- Check that `TELEGRAM_BOT_TOKEN` is set correctly in Secrets
- Run `python bot.py` in the Shell to see the full error output

### ChromeDriver error / "No such file"
- Run `which chromium` and `which chromedriver` in Shell
- Add the exact paths to Secrets (`CHROME_BINARY_PATH`, `CHROMEDRIVER_PATH`)

### CAPTCHA / "unusual traffic" block
- Google sometimes flags headless browser activity
- Wait 5–10 minutes and try again
- Avoid running `/checkoffer` more than 2–3 times in quick succession

### Google is asking for 2FA
- Use an App Password as described above

### "Could not find email/password field"
- Google occasionally A/B tests new sign-in UI layouts
- Open an issue or try again in a few hours

---

## 🔄 Keeping the Bot Running 24/7 (Optional)

Free Replit Repls sleep after inactivity. To keep the bot alive:

**Option A — Replit Core / Deployments**
Use the **Deploy** button in Replit to deploy as an Always-On Repl.

**Option B — External ping (free)**
1. Sign up at [UptimeRobot](https://uptimerobot.com) (free tier)
2. Add a simple HTTP monitor pointing to your Repl's URL
3. This pings your Repl every 5 minutes to prevent sleep

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `python-telegram-bot` | 21.5 | Telegram Bot API framework |
| `selenium` | 4.22.0 | Browser automation |
| `webdriver-manager` | 4.0.1 | Auto-downloads matching ChromeDriver |
| `httpx` | 0.27.0 | Async HTTP (used by PTB v21+) |

System packages (installed via `replit.nix`):
- `chromium` — headless Chromium browser
- `chromedriver` — WebDriver bridge for Chromium
- All required GTK/X11/NSS system libraries

---

## 📜 License

MIT — use freely, no warranties.
