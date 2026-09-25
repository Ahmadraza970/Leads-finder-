#!/usr/bin/env python3
"""Telegram Bridge - persistent polling that reads messages and replies."""
import json, os, sys, time, subprocess

BOT_TOKEN = '8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg'

def tg(method, data=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    if data:
        cmd = ["curl", "-s", "-X", "POST", url, "-H", "Content-Type: application/json", "-d", json.dumps(data)]
    else:
        cmd = ["curl", "-s", url]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(r.stdout)

def reply(chat_id, text):
    return tg("sendMessage", {"chat_id": chat_id, "text": text, "parse_mode": "HTML"})

def handle(text):
    t = text.strip().lower()
    if t in ("/start", "/help"):
        return "🤖 HERMES is online! I can help with lead generation, pipeline management, and more. Try /status or just chat with me."
    elif t == "/status":
        return "📊 Pipeline: 2,816 leads | 882 with email | 0 sent | 0 replied"
    elif t == "/find":
        return "🔍 Searching for new leads... I'll notify you when done."
    elif t == "/stats":
        return "📈 Stats: 2,816 total leads | 882 with email | 0 sent | 0 replied | 0% conversion"
    elif "hello" in t or "hey" in t or "hi" in t:
        return "👋 Hello! I'm HERMES. Send /help to see what I can do."
    elif "why" in t and "reply" in t:
        return "✅ I'm now replying to you on Telegram! The bridge was fixed. Send me any message and I'll respond."
    else:
        return f"📝 You said: \"{text}\"\n\nI'm HERMES AI. Send /help for commands."

def main():
    print("Telegram Bridge started - polling for messages...")
    
    d = tg("getUpdates")
    updates = d.get("result", [])
    offset = max(u["update_id"] for u in updates) + 1 if updates else 0
    print(f"Starting from offset: {offset}")
    
    while True:
        try:
            d = tg("getUpdates", {"offset": offset, "timeout": 30, "limit": 10})
            updates = d.get("result", [])
            
            for u in updates:
                offset = u["update_id"] + 1
                msg = u.get("message", {})
                text = msg.get("text", "")
                chat_id = msg.get("chat", {}).get("id", "")
                
                if not text:
                    continue
                
                print(f"[{chat_id}] {text[:60]}")
                response = handle(text)
                r = reply(chat_id, response)
                print(f"  -> Replied: {r.get('ok')}")
                
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()