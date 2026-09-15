#!/usr/bin/env python3
"""
telegram_notifier.py - Sends updates to Telegram via Bot API.
Cross-platform: auto-detects OS (Windows/Linux/Android-Termux).
"""
import json, os, requests, time, csv
from datetime import datetime

def _hermes_dir():
    """Auto-detect the Hermes working directory cross-platform."""
    env = os.environ.get("HERMES_DIR")
    if env:
        return env
    # Check script's own directory first (most reliable)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.exists(os.path.join(script_dir, "usa_hotel_leads.csv")) or \
       os.path.exists(os.path.join(script_dir, "telegram_config.json")):
        return script_dir
    # Check current working directory
    cwd = os.getcwd()
    if os.path.exists(os.path.join(cwd, "usa_hotel_leads.csv")) or \
       os.path.exists(os.path.join(cwd, "telegram_config.json")):
        return cwd
    # Android/Termux
    if os.path.exists("/data/data/com.termux/files/home/hermes"):
        return "/data/data/com.termux/files/home/hermes"
    # Linux
    if os.path.exists(os.path.expanduser("~/hermes")):
        return os.path.expanduser("~/hermes")
    # Windows fallback
    return os.environ.get("USERPROFILE", "C:/Users/AHMAD RAJA")

HERMES_DIR = _hermes_dir()
BOT_TOKEN = os.environ.get("HERMES_BOT_TOKEN", "8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg")
CHAT_ID = os.environ.get("HERMES_CHAT_ID", "6554462815")
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def send_message(text, parse_mode="Markdown"):
    """Send a message to the Telegram chat."""
    url = f"{BASE_URL}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": text, "parse_mode": parse_mode}
    try:
        r = requests.post(url, json=payload, timeout=15)
        return r.json()
    except Exception as e:
        print(f"Telegram send error: {e}")
        return {"ok": False, "description": str(e)}

def get_updates(offset=None):
    """Poll for incoming Telegram updates (replies)."""
    url = f"{BASE_URL}/getUpdates"
    params = {"timeout": 30}
    if offset:
        params["offset"] = offset
    try:
        r = requests.get(url, params=params, timeout=35)
        return r.json()
    except Exception as e:
        print(f"Telegram get_updates error: {e}")
        return {"ok": False, "description": str(e)}

def parse_incoming_updates(last_update_id=0):
    """Parse incoming Telegram messages and return the latest one."""
    data = get_updates(last_update_id)
    if data.get("ok") and data.get("result"):
        results = data["result"]
        if results:
            latest = results[-1]
            update_id = latest["update_id"]
            message = latest.get("message", {})
            text = message.get("text", "")
            from_user = message.get("from", {})
            from_name = from_user.get("first_name", "User")
            chat = message.get("chat", {})
            chat_id = chat.get("id")
            return {
                "update_id": update_id,
                "text": text,
                "from_name": from_name,
                "chat_id": chat_id,
                "is_command": text.startswith("/")
            }
    return None

if __name__ == "__main__":
    # Test: send a quick test message
    result = send_message("✅ Telegram notifier initialized. USA hotel lead pipeline active.")
    if result.get("ok"):
        print("Test message sent to Telegram successfully.")
    else:
        print(f"Failed to send test message: {result.get('description')}")
    
    # Poll loop for replies
    print("Polling for Telegram replies (Ctrl+C to stop)...")
    last_id = 0
    while True:
        msg = parse_incoming_updates(last_id + 1)
        if msg:
            text = msg["text"]
            from_name = msg["from_name"]
            print(f"💬 Message from {from_name}: {text}")
            
            if text.startswith("/"):
                if text == "/status":
                    send_message("🟡 USA Hotel Pipeline Status: Finding leads → Verifying emails → Sending cold emails → Waiting for replies")
                elif text == "/leads":
                    csv_path = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
                    if os.path.exists(csv_path):
                        rows = list(csv.DictReader(open(csv_path, encoding="utf-8")))
                        count = len(rows)
                        verified = sum(1 for r in rows if r.get("status") == "verified_valid")
                        send_message(f"📊 *USA Leads Report*\nTotal: {count}\nVerified emails: {verified}\nSheet ID: 1cHgkbafxil3J80KB8RuAaS4Rw82iaKaPA7ckHe8lMfA")
                    else:
                        send_message("No leads CSV found yet.")
                elif text == "/demo":
                    send_message("🤖 Demo mode: Send a hotel name to generate a mock demo link.")
                elif text.startswith("/send"):
                    parts = text.split(" ", 1)
                    if parts[1]:
                        send_message(f"📧 Test email send triggered (manual review required). Target: {parts[1]}")
                else:
                    send_message(f"Unknown command: {text}")
            else:
                # Incoming message - pass to reply handler logic
                send_message(f"📨 Received reply from user: *{from_name}*: _{text}_\nAwaiting your AI analysis and approval.")
        time.sleep(3)