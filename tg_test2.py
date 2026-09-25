import subprocess, json

token = '8614803868:AAHYDLM63tYKGp668UQbCU8lKXDwLHcuHfg'
chat_id = '6554462815'

# Test getMe
url = f'https://api.telegram.org/bot{token}/getMe'
cmd = ['curl', '-s', url]
r = subprocess.run(cmd, capture_output=True, text=True)
d = json.loads(r.stdout)
print(f'getMe: ok={d.get("ok")}, username={d.get("result", {}).get("username", "?")}')

# Test sendMessage
url = f'https://api.telegram.org/bot{token}/sendMessage'
data = json.dumps({'chat_id': chat_id, 'text': 'Test message from Hermes', 'parse_mode': 'HTML'})
cmd = ['curl', '-s', '-X', 'POST', url, '-H', 'Content-Type: application/json', '-d', data]
r = subprocess.run(cmd, capture_output=True, text=True)
d = json.loads(r.stdout)
print(f'sendMessage: ok={d.get("ok")}, msg_id={d.get("result", {}).get("message_id")}')

# Test getUpdates
url = f'https://api.telegram.org/bot{token}/getUpdates'
cmd = ['curl', '-s', url]
r = subprocess.run(cmd, capture_output=True, text=True)
d = json.loads(r.stdout)
updates = d.get('result', [])
print(f'getUpdates: {len(updates)} pending')
for u in updates:
    print(f'  [{u["update_id"]}] {u.get("message", {}).get("text", "")[:60]}')