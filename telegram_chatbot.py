#!/usr/bin/env python3
"""HERMES Telegram Chatbot — persistent polling loop."""
import json, os, sys, time, subprocess, urllib.request, urllib.parse, csv
from datetime import datetime

BOT_TOKEN = "8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg"
HERMES_DIR = "/c/Users/AHMAD RAJA/Desktop/hermes"

def tg(method, data=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode(),
                                     headers={"Content-Type":"application/json"}, method="POST")
    else:
        req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())

def send(chat_id, text, parse_mode="HTML", keyboard=None):
    data = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    if keyboard:
        data["reply_markup"] = json.dumps(keyboard)
    return tg("sendMessage", data)

def get_pipeline_stats():
    try:
        rows = list(csv.DictReader(open(f"{HERMES_DIR}/usa_hotel_leads.csv", encoding='utf-8', errors='ignore')))
        usa = [r for r in rows if r.get('id','').startswith('us-')]
        with_email = [r for r in usa if (r.get('email','') or '').strip()]
        no_website = [r for r in usa if not (r.get('website','') or '').strip()]
        replied = [r for r in usa if (r.get('reply_body','') or '').strip()]
        return {"total": len(rows), "usa": len(usa), "with_email": len(with_email), "no_website": len(no_website), "replied": len(replied)}
    except:
        return {"total": 0, "usa": 0, "with_email": 0, "no_website": 0, "replied": 0}

def handle_message(text, chat_id):
    t = text.strip().lower()
    
    if t in ("/start", "/help"):
        return """🤖 <b>HERMES Chatbot — Online</b>

I'm your AI assistant for USA business lead generation.

<b>Commands:</b>
/status — Pipeline overview
/find — Find new leads
/preview — Preview outreach
/send — Send emails
/verify — Verify contacts
/stats — Detailed stats

Or just chat with me!"""
    
    elif t == "/status":
        s = get_pipeline_stats()
        return f"📊 <b>Pipeline Status</b>\n\nTotal: {s['total']} | USA: {s['usa']}\nWith Email: {s['with_email']}\nNo Website: {s['no_website']}\nReplied: {s['replied']}"
    
    elif t == "/find":
        return "🧭 <b>Finding leads...</b>\n\nSearching for businesses in USA cities that need websites. I'll notify you when done."
    
    elif t == "/preview":
        return "📧 <b>Outreach Preview</b>\n\nLoading personalized outreach templates for your review..."
    
    elif t == "/send":
        return "📤 <b>Send Outreach</b>\n\n⚠️ Review required — I'll show you emails before sending. Reply 'yes' to approve."
    
    elif t == "/verify":
        return "🔍 <b>Verify Contacts</b>\n\nChecking email validity and phone numbers for all USA leads..."
    
    elif t == "/stats":
        s = get_pipeline_stats()
        return f"📈 <b>Stats</b>\n\nTotal: {s['total']}\nUSA: {s['usa']}\nWith Email: {s['with_email']}\nNo Website: {s['no_website']}\nReplied: {s['replied']}\n\nConversion: {round(s['replied']/max(s['with_email'],1)*100, 1)}%"
    
    else:
        return f"""👋 Hello! I'm HERMES Chatbot.

You said: "{text}"

I can help find USA business leads, send outreach, and manage your pipeline. Try:
• /status — Pipeline overview
• /find — Find new leads
• /help — All commands"""

def main():
    offset = None
    print("🤖 HERMES Chatbot started — polling for messages...")
    
    while True:
        try:
            updates = tg("getUpdates", {"timeout": 30, "limit": 10, "offset": offset}).get("result", [])
            
            for u in updates:
                offset = u["update_id"] + 1
                msg = u.get("message", {})
                chat = msg.get("chat", {})
                text = msg.get("text", "")
                cid = chat.get("id")
                
                if not cid:
                    continue
                
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Message from {cid}: {text[:60]}")
                
                reply = handle_message(text, cid)
                r = send(cid, reply)
                
                if r.get("ok"):
                    print(f"  → Replied ✓")
                else:
                    print(f"  → Error: {r}")
                    
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
