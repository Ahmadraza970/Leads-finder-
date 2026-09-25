import subprocess, json

BOT_TOKEN = "***"
CHAT_ID = "6554462815"

def tg(method, data=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    if data:
        cmd = ["curl", "-s", "-X", "POST", url, "-H", "Content-Type: application/json", "-d", json.dumps(data)]
    else:
        cmd = ["curl", "-s", url]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(r.stdout)

# Test 1: getMe
d = tg("getMe")
print(f"Bot: @{d['result']['username']} (ID: {d['result']['id']})")

# Test 2: sendMessage
d = tg("sendMessage", {"chat_id": CHAT_ID, "text": "✅ Hermes is now replying to you on Telegram too! Send me any message and I will respond here.", "parse_mode": "HTML"})
print(f"Message sent: {d.get('ok')} (ID: {d.get('result', {}).get('message_id')})")

# Test 3: getUpdates
d = tg("getUpdates")
updates = d.get("result", [])
print(f"Pending updates: {len(updates)}")
for u in updates:
    print(f"  [{u['update_id']}] {u.get('message', {}).get('text', '')[:80]}")