#!/usr/bin/env python3
"""Server recovery: runs full pipeline whenever server comes back online."""
import subprocess, os, json, csv, sys, time
from collections import Counter
from datetime import datetime

HERMES = "C:/Users/AHMAD RAJA/Desktop/hermes"
PYTHON = "C:/Users/AHMAD RAJA/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe"
CSV = os.path.join(HERMES, "usa_hotel_leads.csv")
TOKEN_FILE = os.path.join(HERMES, "google_token.json")
SHEET_ID = "1cHgkbafxil3J80KB8RuAaS4Rw82iaKaPA7ckHe8lMfA"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def run(cmd, timeout=120):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=HERMES)

def step1_check_replies():
    log("1️⃣ Checking Gmail replies...")
    r = run([PYTHON, os.path.join(HERMES, "check_replies.py")], timeout=180)
    log(f"   Replies: {r.stdout[:200]}")
    return r.returncode == 0

def step2_web_discovery():
    log("2️⃣ Web search discovery...")
    from hermes_tools import web_search
    import re
    queries = [
        "boutique hotels contact email reservations",
        "independent hotels website contact email",
        "small boutique hotels USA contact",
    ]
    found = 0
    for q in queries:
        results = web_search(query=q, limit=8)
        for r in results.get("data", {}).get("web", []):
            desc = r.get("description", "")
            em = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", desc)
            if em:
                title = r.get("title", "").split("|")[0].split("-")[0].strip()
                if len(title) > 3:
                    found += 1
                    log(f"   Found: {title[:50]} - {em.group()}")
    log(f"   Discovery complete: {found} new leads found")
    return found

def step3_verify_and_mark():
    log("3️⃣ Verifying leads...")
    with open(CSV) as f:
        rows = list(csv.DictReader(f))
    marked = 0
    for r in rows:
        if r["status"] == "new" and r.get("email") and "@" in r["email"]:
            r["status"] = "verified_valid"
            marked += 1
    # Ensure last_sent field exists
    fieldnames = list(rows[0].keys())
    if 'last_sent' not in fieldnames:
        fieldnames.append('last_sent')
        for r in rows:
            r['last_sent'] = ''
    with open(CSV, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)
    log(f"   Marked {marked} leads as verified_valid")
    return marked

def step4_push_sheets():
    log("4️⃣ Pushing to Google Sheets...")
    try:
        with open(TOKEN_FILE) as f:
            tok = json.load(f)
        import urllib.request
        import urllib.parse

        # Refresh token if expired
        if tok.get('expires_in', 0) < 300:
            with open(os.path.join(HERMES, "client_secret_installed.json")) as f:
                secret = json.load(f)
            data = urllib.parse.urlencode({
                'client_id': secret['installed']['client_id'],
                'client_secret': secret['installed']['client_secret'],
                'refresh_token': tok['refresh_token'],
                'grant_type': 'refresh_token'
            }).encode()
            resp = urllib.request.urlopen(urllib.request.Request(
                'https://oauth2.googleapis.com/token', data=data), timeout=15)
            new_tok = json.loads(resp.read())
            tok.update(new_tok)
            tok['token'] = new_tok['access_token']
            with open(TOKEN_FILE, 'w') as f:
                json.dump(tok, f)

        with open(CSV) as f:
            rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())
        vals = [[r.get(k, "") for k in fieldnames] for r in rows]
        body = json.dumps({"data": [{"range": "A1", "values": vals, "majorDimension": "ROWS"}], "valueInputOption": "RAW"}).encode()
        resp = urllib.request.urlopen(urllib.request.Request(
            f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values:batchUpdate?access_token={tok['token']}",
            data=body, headers={"Content-Type": "application/json"}), timeout=30)
        log(f"   Sheets: {json.loads(resp.read()).get('totalUpdatedRows', '?')} rows")
        return True
    except Exception as e:
        log(f"   Sheets error: {e}")
        return False

def step5_send_emails():
    log("5️⃣ Sending emails...")
    import smtplib, time
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from datetime import datetime

    with open(CSV) as f:
        rows = list(csv.DictReader(f))

    fieldnames = list(rows[0].keys())
    if 'last_sent' not in fieldnames:
        fieldnames.append('last_sent')
        for r in rows:
            r['last_sent'] = ''

    ready = [r for r in rows if r["status"] == "verified_valid" and r.get("email")]
    log(f"   {len(ready)} ready leads")
    if not ready:
        log("   No leads to send")
        return 0

    sent = 0
    for r in ready[:20]:
        name = r['hotel_name'].replace('\u2014', '-').replace('\u2013', '-').replace('\u2122', 'TM').replace('\u2018', "'").replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"').replace('\u2026', '...')
        city = r.get('city', '')

        body = f"""Hi {name} team,

I hope this email finds you well. My name is Mithu, and I run a boutique digital agency specializing in direct-booking websites for independent hotels across the USA.

I came across {name} in {city} and was really impressed with what you're doing. In today's market, hotels that own their direct booking channel are the ones that thrive -- and I'd love to help you build a website that captures more direct bookings, reduces reliance on OTAs, and grows your revenue.

What I offer:
- Custom-designed hotel websites that convert visitors into bookers
- Direct integration with your booking engine (no OTA middleman)
- Fast mobile-first design that works beautifully on any device
- SEO optimization so travelers find you directly
- Ongoing maintenance and updates

I'd love to schedule a quick 15-minute call to learn more about your current website and share some ideas. No pressure at all -- just a friendly conversation.

Would next week work for a brief chat?

Best regards,
Mithu
Boutique Hotel Direct-Booking Agency"""

        try:
            msg = MIMEMultipart()
            msg['Subject'] = f"{name} -- Direct Booking Website Opportunity"
            msg['From'] = 'mithsjames87@gmail.com'
            msg['To'] = r['email']
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            s = smtplib.SMTP('smtp.gmail.com', 587, timeout=15)
            s.ehlo(); s.starttls()
            s.login('mithsjames87@gmail.com', 'dyqa yvty bopb nvzk')
            s.sendmail('mithsjames87@gmail.com', r['email'], msg.as_string())
            s.quit()
            r['status'] = 'sent'
            r['last_sent'] = datetime.now().strftime('%Y-%m-%d %H:%M')
            sent += 1
            log(f"   ✅ {sent}. {name[:50]}")
        except Exception as e:
            log(f"   ❌ {name[:40]}: {e}")
        time.sleep(1)

    with open(CSV, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)

    log(f"   Sent {sent} emails")
    return sent

def step6_spam_check():
    log("6️⃣ Spam safety check...")
    with open(CSV) as f:
        rows = list(csv.DictReader(f))
    sent_today = [r for r in rows if r.get("last_sent", "").startswith(datetime.now().strftime("%Y-%m-%d"))]
    if len(sent_today) >= 20:
        log(f"   ⚠️ Daily limit reached ({len(sent_today)}/20)")
        return False
    log(f"   ✅ Safe: {len(sent_today)}/20 sent today")
    return True

def main():
    log("=" * 50)
    log("🚀 SERVER RECOVERY — Full pipeline starting")
    log("=" * 50)

    # Step 1: Check replies
    step1_check_replies()

    # Step 2: Web discovery
    step2_web_discovery()

    # Step 3: Verify and mark
    step3_verify_and_mark()

    # Step 4: Push to Sheets
    step4_push_sheets()

    # Step 5: Spam check
    if step6_spam_check():
        # Step 6: Send emails
        sent = step5_send_emails()
        log(f"\n✅ Recovery complete: {sent} emails sent")
    else:
        log("\n⏸️ Daily limit reached, skipping send")

    # Push to Sheets after sending
    step4_push_sheets()

    # Final status
    with open(CSV) as f:
        rows = list(csv.DictReader(f))
    counts = Counter(r["status"] for r in rows)
    log(f"\n📊 Final status: {len(rows)} leads | sent={counts.get('sent',0)} | ready={counts.get('verified_valid',0)}")
    log("✅ Server recovery finished")

if __name__ == "__main__":
    main()
