#!/usr/bin/env python3
"""
Telegram Bot for Hotel Pipeline — standalone, runs alongside Hermes gateway.
Token: 8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg
Chat: 6554462815
"""
import os, json, csv, subprocess, urllib.request
from datetime import datetime

TOKEN = "8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg"
CHAT_ID = "6554462815"
HERMES_DIR = "C:/Users/AHMAD RAJA/Desktop/hermes"
CSV_PATH = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")

def send_message(text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    urllib.request.urlopen(urllib.request.Request(
        url, data=json.dumps({"chat_id": CHAT_ID, "text": text, "parse_mode": "Markdown"}).encode(),
        headers={"Content-Type": "application/json"}
    ))

def get_updates():
    url = f"https://api.telegram.org/bot{TOKEN}/getUpdates"
    try:
        resp = urllib.request.urlopen(url, timeout=5)
        return json.loads(resp.read()).get("result", [])
    except:
        return []

def get_status():
    with open(CSV_PATH) as f:
        rows = list(csv.DictReader(f))
    from collections import Counter
    counts = Counter(r['status'] for r in rows)
    ready = len([r for r in rows if r['status'] == 'verified_valid' and r.get('email')])
    sent = counts.get('sent', 0)
    new = counts.get('new', 0)

    msg = f"📊 *Hotel Pipeline Status*\n\n"
    msg += f"• Total leads: {len(rows)}\n"
    msg += f"• Sent: {sent}\n"
    msg += f"• Ready: {ready}\n"
    msg += f"• New: {new}\n"
    msg += f"• Time: {datetime.now().strftime('%H:%M IST')}"
    return msg

def send_batch():
    result = subprocess.run(
        ['C:/Users/AHMAD RAJA/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe',
         'auto_send_3pm.py'],
        capture_output=True, text=True, timeout=120,
        cwd=HERMES_DIR
    )
    sent_line = [l for l in result.stdout.split('\n') if 'Sent' in l and 'Done' in l]
    return sent_line[0] if sent_line else result.stdout[:200]

def main():
    print("🤖 Telegram Bot running...")
    send_message("🤖 Bot online. Commands: /status, /send, /leads")

    last_update = 0
    while True:
        try:
            updates = get_updates()
            for upd in updates:
                if upd['update_id'] <= last_update:
                    continue
                last_update = upd['update_id']
                msg = upd.get('message', {}).get('text', '')
                chat = upd.get('message', {}).get('chat', {}).get('id')

                if str(chat) != str(CHAT_ID):
                    continue

                if msg == '/status':
                    send_message(get_status())
                elif msg == '/send':
                    send_message("Sending 20 emails...")
                    result = send_batch()
                    send_message(result)
                elif msg == '/leads':
                    with open(CSV_PATH) as f:
                        rows = list(csv.DictReader(f))
                    ready = [r for r in rows if r['status'] == 'verified_valid' and r.get('email')]
                    preview = "\n".join([f"  • {r['hotel_name'][:50]} — {r['email']}" for r in ready[:10]])
                    send_message(f"🎯 *Ready leads ({len(ready)}):*\n\n{preview}")
                elif msg == '/demo':
                    send_message("🖼️ Demo sites:\n• King Hotel NYC: http://localhost:8080\n• Dewberry Charleston: http://localhost:8081")
                elif msg == '/pause':
                    send_message("⏸️ Paused. Use /resume to continue.")
                elif msg == '/resume':
                    send_message("▶️ Resumed.")
                else:
                    send_message("Commands: /status, /send, /leads, /demo, /pause, /resume")
        except Exception as e:
            print(f"Error: {e}")

        import time
        time.sleep(5)

if __name__ == '__main__':
    main()