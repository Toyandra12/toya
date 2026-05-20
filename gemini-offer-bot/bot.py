"""
bot.py — Telegram bot entry point for the Gemini Offer Checker.

Commands
--------
/start       — Welcome message and command overview
/login       — Begin credential collection (email then password)
/checkoffer  — Run the headless browser check against Google One
/getlink     — Return the saved activation link (or the fallback URL)
/status      — Show current session state for this user
/logout      — Clear credentials and session data from memory
/help        — Show the command list again

Design notes
------------
* Credentials are stored ONLY in config.USER_SESSIONS (in-process dict).
  They are never written to disk, logged, or transmitted anywhere except
  directly to Google via the headless browser.
* The password message is deleted from Telegram chat immediately after reading.
* The browser check runs in a ThreadPoolExecutor so it does not block the
  asyncio event loop.
* Each user gets a completely independent session entry.
"""

import asyncio
import logging
import sys
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from telegram import Update, ReplyKeyboardRemove
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

import config
import google_automation

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ── Conversation states ───────────────────────────────────────────────────────
AWAIT_EMAIL, AWAIT_PASSWORD = range(2)

# ── Thread pool for blocking Selenium work ────────────────────────────────────
_executor = ThreadPoolExecutor(max_workers=4)


# ── Session helpers ───────────────────────────────────────────────────────────

def _get_session(user_id: int) -> dict:
    """Return (creating if needed) the session dict for *user_id*."""
    if user_id not in config.USER_SESSIONS:
        config.USER_SESSIONS[user_id] = {
            "email":    None,
            "password": None,
            "status":   "no_credentials",   # no_credentials | ready | checking | done | error
            "offer":    None,               # CheckResult or None
        }
    return config.USER_SESSIONS[user_id]


def _clear_session(user_id: int) -> None:
    """Wipe all credentials and results for *user_id*."""
    config.USER_SESSIONS.pop(user_id, None)


def _status_emoji(status: str) -> str:
    return {
        "no_credentials": "🔑",
        "ready":          "✅",
        "checking":       "🔄",
        "done":           "🎉",
        "error":          "❌",
    }.get(status, "❓")


# ── /start ────────────────────────────────────────────────────────────────────

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    await update.message.reply_text(
        f"👋 Hi *{user.first_name}*\\! Welcome to the *Gemini Offer Checker* bot\\.\n\n"
        "I'll check your Google account to see if you have the free *12\\-month "
        "Gemini Pro \\(AI Premium\\)* offer in Google One\\.\n\n"
        "━━━━━━━━━━━━━━━━\n"
        "📋 *Commands*\n"
        "━━━━━━━━━━━━━━━━\n"
        "/login — Enter your Gmail credentials\n"
        "/checkoffer — Run the Google One check\n"
        "/getlink — Get the offer activation link\n"
        "/status — View your current session\n"
        "/logout — Clear your credentials\n"
        "/help — Show this message again\n\n"
        "🔒 *Privacy note:* Your password is deleted from this chat "
        "immediately after I read it and is never stored anywhere\\.",
        parse_mode=ParseMode.MARKDOWN_V2,
    )


# ── /help ─────────────────────────────────────────────────────────────────────

async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "📋 *Available Commands*\n\n"
        "/start — Welcome screen\n"
        "/login — Enter your Gmail address \\+ password\n"
        "/checkoffer — Check Google One for the Gemini Pro offer\n"
        "/getlink — Show the saved offer link\n"
        "/status — Show your session status\n"
        "/logout — Remove your credentials from memory\n"
        "/help — This message\n\n"
        "⚠️ If Google asks for 2FA, use an *App Password* instead of your "
        "real password\\. Generate one at:\n"
        "`Google Account → Security → App Passwords`",
        parse_mode=ParseMode.MARKDOWN_V2,
    )


# ── /login (ConversationHandler) ──────────────────────────────────────────────

async def cmd_login(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Entry point: ask for email."""
    user_id = update.effective_user.id
    session = _get_session(user_id)

    if session["email"] and session["password"]:
        await update.message.reply_text(
            f"ℹ️ You're already logged in as *{session['email']}*\\.\n"
            "Use /logout first if you want to switch accounts\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return ConversationHandler.END

    await update.message.reply_text(
        "📧 Please enter your *Gmail address*:",
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=ReplyKeyboardRemove(),
    )
    return AWAIT_EMAIL


async def received_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Store email and ask for password."""
    user_id = update.effective_user.id
    email   = update.message.text.strip()

    if "@" not in email or "." not in email:
        await update.message.reply_text(
            "⚠️ That doesn't look like a valid email address\\. Please try again:",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return AWAIT_EMAIL

    session = _get_session(user_id)
    session["email"] = email

    await update.message.reply_text(
        f"✅ Email saved: `{email}`\n\n"
        "🔐 Now enter your *password*\\.\n\n"
        "I will delete your password message immediately after reading it\\.\n\n"
        "💡 Tip: If you have 2FA enabled, send an *App Password* here instead\\.",
        parse_mode=ParseMode.MARKDOWN_V2,
    )
    return AWAIT_PASSWORD


async def received_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Store password in memory, delete the message, confirm ready state."""
    user_id  = update.effective_user.id
    password = update.message.text  # raw — do NOT strip (some passwords have spaces)

    # ── Delete the password message from Telegram chat ────────────────────────
    try:
        await update.message.delete()
        deleted_ok = True
    except Exception as exc:
        logger.warning("Could not delete password message: %s", exc)
        deleted_ok = False

    session = _get_session(user_id)
    session["password"] = password
    session["status"]   = "ready"

    deletion_note = (
        "🗑️ \\(Your password message has been deleted from this chat\\.\\)"
        if deleted_ok
        else "⚠️ \\(I couldn't delete your password message — please delete it manually\\.\\)"
    )

    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "✅ *Credentials saved in memory\\.*\n\n"
            f"{deletion_note}\n\n"
            "You can now run /checkoffer to start the Google One check\\."
        ),
        parse_mode=ParseMode.MARKDOWN_V2,
    )
    return ConversationHandler.END


async def cancel_login(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancel the login conversation."""
    await update.message.reply_text(
        "❌ Login cancelled\\. Your credentials were not saved\\.",
        parse_mode=ParseMode.MARKDOWN_V2,
    )
    return ConversationHandler.END


# ── /checkoffer ───────────────────────────────────────────────────────────────

async def cmd_check_offer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Kick off the headless browser check in a background thread."""
    user_id = update.effective_user.id
    session = _get_session(user_id)

    if not session["email"] or not session["password"]:
        await update.message.reply_text(
            "⚠️ No credentials found\\. Please /login first\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    if session["status"] == "checking":
        await update.message.reply_text(
            "🔄 A check is already running for your account\\. Please wait\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    session["status"] = "checking"
    session["offer"]  = None

    await update.message.reply_text(
        f"🚀 Starting Google One check for *{_escape_md(session['email'])}*\\.\\.\\.\n\n"
        "⏳ This may take 30–60 seconds\\. I'll message you when it's done\\.",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    # Run blocking Selenium work in thread pool
    loop = asyncio.get_event_loop()
    try:
        result: google_automation.CheckResult = await loop.run_in_executor(
            _executor,
            google_automation.check_gemini_offer,
            session["email"],
            session["password"],
        )
    except Exception as exc:
        logger.exception("check_gemini_offer raised unexpectedly")
        session["status"] = "error"
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=f"❌ An internal error occurred:\n`{_escape_md(str(exc))}`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    # Store result
    session["offer"] = result

    if result.requires_2fa:
        session["status"] = "error"
    elif result.offer_found:
        session["status"] = "done"
    elif result.success:
        session["status"] = "done"
    else:
        session["status"] = "error"

    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=_escape_md(result.message),
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    # If an offer link was found, send it as a separate clickable message
    if result.offer_link and result.offer_found:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=(
                "🔗 *Tap the link below to activate your offer:*\n"
                f"{result.offer_link}"
            ),
            parse_mode=ParseMode.MARKDOWN_V2,
            disable_web_page_preview=False,
        )


# ── /getlink ──────────────────────────────────────────────────────────────────

async def cmd_get_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Return the saved offer link or the fallback Google One URL."""
    user_id = update.effective_user.id
    session = _get_session(user_id)
    result: Optional[google_automation.CheckResult] = session.get("offer")

    if result and result.offer_link:
        if result.offer_found:
            await update.message.reply_text(
                f"🎉 *Offer link for {_escape_md(session['email'])}:*\n\n"
                f"📌 {_escape_md(result.offer_title)}\n"
                f"🔗 {result.offer_link}",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
        else:
            await update.message.reply_text(
                "ℹ️ No specific offer link was found\\.\n\n"
                "You can check Google One manually here:\n"
                f"{config.GOOGLE_ONE_OFFERS_URL}",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
    elif session.get("email"):
        await update.message.reply_text(
            "ℹ️ No check has been run yet\\.\n"
            "Use /checkoffer to scan your account\\.\n\n"
            "In the meantime, you can check manually:\n"
            f"{config.GOOGLE_ONE_OFFERS_URL}",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
    else:
        await update.message.reply_text(
            "⚠️ No session found\\. Please /login first\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )


# ── /status ───────────────────────────────────────────────────────────────────

async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show a summary of the current user session."""
    user_id = update.effective_user.id
    session = _get_session(user_id)
    result: Optional[google_automation.CheckResult] = session.get("offer")

    status  = session.get("status", "no_credentials")
    emoji   = _status_emoji(status)
    email   = session.get("email") or "—"
    has_pwd = "✅ Saved in memory" if session.get("password") else "❌ Not set"

    offer_line = "—"
    if result:
        if result.offer_found:
            offer_line = f"✅ Found: {result.offer_title}"
        elif result.success:
            offer_line = "😔 No offer found for this account"
        else:
            offer_line = f"❌ Check failed: {result.error or 'unknown error'}"

    await update.message.reply_text(
        "📊 *Your Session Status*\n\n"
        f"📧 Email:     `{_escape_md(email)}`\n"
        f"🔑 Password:  {has_pwd}\n"
        f"{emoji} Status:    `{_escape_md(status)}`\n"
        f"🎁 Offer:     {_escape_md(offer_line)}\n\n"
        "_Use /checkoffer to run a new check or /logout to clear your session\\._",
        parse_mode=ParseMode.MARKDOWN_V2,
    )


# ── /logout ───────────────────────────────────────────────────────────────────

async def cmd_logout(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Clear all credentials and session data for this user."""
    user_id = update.effective_user.id
    had_session = user_id in config.USER_SESSIONS
    _clear_session(user_id)

    if had_session:
        await update.message.reply_text(
            "✅ Your credentials and session data have been cleared from memory\\.\n\n"
            "Use /login to start a new session\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
    else:
        await update.message.reply_text(
            "ℹ️ No active session to clear\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )


# ── Utility ───────────────────────────────────────────────────────────────────

def _escape_md(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2."""
    special = r"\_*[]()~`>#+-=|{}.!"
    return "".join(f"\\{c}" if c in special else c for c in str(text))


# ── Error handler ─────────────────────────────────────────────────────────────

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error("Unhandled exception", exc_info=context.error)
    if isinstance(update, Update) and update.effective_message:
        await update.effective_message.reply_text(
            "❌ An unexpected error occurred\\. Please try again in a moment\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )


# ── Application bootstrap ─────────────────────────────────────────────────────

def main() -> None:
    token = config.TELEGRAM_BOT_TOKEN
    if not token:
        logger.critical(
            "TELEGRAM_BOT_TOKEN is not set. "
            "Add it to your Replit Secrets (key: TELEGRAM_BOT_TOKEN)."
        )
        sys.exit(1)

    app = Application.builder().token(token).build()

    # ── Login conversation ─────────────────────────────────────────────────
    login_conv = ConversationHandler(
        entry_points=[CommandHandler("login", cmd_login)],
        states={
            AWAIT_EMAIL: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, received_email)
            ],
            AWAIT_PASSWORD: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, received_password)
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel_login)],
        allow_reentry=True,
    )

    # ── Register handlers ──────────────────────────────────────────────────
    app.add_handler(login_conv)
    app.add_handler(CommandHandler("start",      cmd_start))
    app.add_handler(CommandHandler("help",       cmd_help))
    app.add_handler(CommandHandler("checkoffer", cmd_check_offer))
    app.add_handler(CommandHandler("getlink",    cmd_get_link))
    app.add_handler(CommandHandler("status",     cmd_status))
    app.add_handler(CommandHandler("logout",     cmd_logout))
    app.add_error_handler(error_handler)

    logger.info("Bot is starting — polling for updates…")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
