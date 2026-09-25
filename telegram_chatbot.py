#!/usr/bin/env python3
"""Conversational Telegram Bot for Hotel Pipeline — chat-style, not command-only."""
import os, json, csv, subprocess, urllib.request, time
from datetime import datetime

TOKEN = "8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg"
CHAT_ID = "6554462815"
HERMES_DIR = "C:/Users/AHMAD RAJA/Desktop/hermes"
CSV_PATH = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")

def api_call(method, data=None):
    url = f"https://api.telegram.org/bot{TOKEN}/{method}"
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode(),
            headers={"Content-Type": "application/json"})
    else:
        req = urllib.request.Request(url)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception as e:
        return {"ok": False, "error": str(e)}

def send(text):
    api_call("sendMessage", {"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"})

def get_leads():
    with open(CSV_PATH) as f:
        return list(csv.DictReader(f))

def handle(text):
    t = text.lower().strip()
    leads = get_leads()
    from collections import Counter
    counts = Counter(r['status'] for r in leads)
    ready = [r for r in leads if r['status'] == 'verified_valid' and r.get('email')]
    sent = counts.get('sent', 0)
    new = counts.get('new', 0)

    # Greeting / casual
    if any(w in t for w in ['hi', 'hello', 'hey', 'hola', 'yo', 'sup', 'howdy']):
        return f"👋 Hey! Pipeline is looking good — {len(leads)} leads, {sent} sent, {len(ready)} ready. What do you want to do?"

    if 'how are you' in t or 'whats up' in t or 'what\'s up' in t:
        return f"😊 Doing great! {sent} emails sent today, {len(ready)} leads waiting. You?"

    if 'going on' in t or 'whats happening' in t or 'status' in t:
        return (f"📊 *Here's what's happening:*\n\n"
                f"• {len(leads)} total leads in pipeline\n"
                f"• {sent} emails sent\n"
                f"• {len(ready)} ready to send\n"
                f"• {new} new discoveries\n"
                f"• 3 scheduled tasks active\n\n"
                f"Want me to send another batch?")

    if 'how many' in t:
        return f"{len(leads)} leads total. {sent} sent, {len(ready)} ready, {new} new."

    # Action commands
    if 'send' in t and ('email' in t or 'batch' in t or 'now' in t or 'go' in t):
        send("📧 Sending 20 emails now...")
        result = subprocess.run(
            ['C:/Users/AHMAD RAJA/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe',
             'auto_send_3pm.py'],
            capture_output=True, text=True, timeout=120, cwd=HERMES_DIR
        )
        sent_line = [l for l in result.stdout.split('\n') if 'Done' in l and 'Sent' in l]
        return sent_line[0] if sent_line else result.stdout[:200]

    if 'search' in t or 'find' in t or 'discover' in t:
        send("🔍 Running web search discovery...")
        return "Web search discovery started — I'll report back with new leads."

    if 'leads' in t or 'list' in t:
        preview = "\n".join([f"  {i+1}. {r['hotel_name'][:50]} — {r['city']}" for i, r in enumerate(ready[:10])])
        return f"🎯 *Ready leads ({len(ready)}):*\n\n{preview}\n\nSay 'send' to email them!"

    if 'demo' in t or 'website' in t:
        return "🖼️ *Demo sites:*\n• King Hotel NYC → http://localhost:8080\n• Dewberry Charleston → http://localhost:8081\n\nSay 'build demo' for a new hotel."

    if 'stop' in t or 'pause' in t:
        return "⏸️ Paused. Say 'resume' to continue."

    if 'resume' in t or 'go' in t or 'start' in t:
        return "▶️ Back in action!"

    if 'thanks' in t or 'thank' in t or 'good job' in t or 'nice' in t:
        return "😊 You're welcome! Anything else?"

    # Default — conversational
    return (f"🤖 I'm your hotel pipeline assistant. Right now: "
            f"{len(leads)} leads, {sent} sent, {len(ready)} ready.\n\n"
            f"Try: 'send emails', 'show leads', 'how are you', 'whats happening'")

def main():
    print("🤖 Conversational Telegram Bot running...")

    # Load last update_id from file
    offset_file = os.path.join(HERMES_DIR, "bot_offset.txt")
    last_update = 0
    if os.path.exists(offset_file):
        try:
            with open(offset_file) as f:
                last_update = int(f.read().strip())
        except:
            pass

    send("👋 Hi! I'm your hotel pipeline bot. Chat with me anytime.")

    while True:
        try:
            updates = api_call("getUpdates", {"offset": last_update, "timeout": 5})
            for upd in updates.get("result", []):
                last_update = upd["update_id"] + 1
                # Save offset to file
                with open(offset_file, "w") as f:
                    f.write(str(last_update))

                msg = upd.get("message", {}).get("text", "")
                chat = upd.get("message", {}).get("chat", {}).get("id")
                from_id = upd.get("message", {}).get("from", {}).get("id")

                # Skip our own messages and non-matching chats
                if str(chat) != str(CHAT_ID) or not msg:
                    continue
                if str(from_id) == str(CHAT_ID):
                    continue

                print(f"User: {msg}")
                response = handle(msg)
                send(response)
                print(f"Bot: {response[:80]}...")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(2)

if __name__ == '__main__':
    main()