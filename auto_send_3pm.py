#!/usr/bin/env python3
"""
auto_send_3pm.py - Auto-sends 20 cold emails daily at 3:00 PM IST (09:30 UTC).
Anti-spam: proper headers, unsubscribe link, plain text, no HTML spam.
Runs as a standalone script or via Windows Task Scheduler.
"""
import os, json, csv, base64, time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import urllib.request, urllib.parse

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")
GOOGLE_TOKEN = os.path.join(HERMES_DIR, "google_token.json")
CLIENT_SECRET = os.path.join(HERMES_DIR, "client_secret.json")

def refresh_token():
    """Refresh Google OAuth token if expired."""
    with open(GOOGLE_TOKEN, encoding="utf-8") as f:
        token = json.load(f)
    with open(CLIENT_SECRET, encoding="utf-8") as f:
        secret = json.load(f)
    
    data = urllib.parse.urlencode({
        "client_id": secret["installed"]["client_id"],
        "client_secret": secret["installed"]["client_secret"],
        "refresh_token": token["refresh_token"],
        "grant_type": "refresh_token"
    }).encode()
    
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    with urllib.request.urlopen(req, timeout=30) as resp:
        new = json.loads(resp.read().decode())
    
    token["token"] = new["access_token"]
    token["expiry"] = (datetime.utcnow() + timedelta(seconds=new.get("expires_in", 3600))).isoformat() + "Z"
    
    with open(GOOGLE_TOKEN, "w", encoding="utf-8") as f:
        json.dump(token, f, indent=2)
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Token refreshed. Expires: {token['expiry']}")

def send_batch(limit=20):
    """Send up to `limit` cold emails to verified USA hotel leads."""
    refresh_token()
    
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    
    creds = Credentials.from_authorized_user_file(
        GOOGLE_TOKEN,
        ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"]
    )
    service = build("gmail", "v1", credentials=creds)
    
    # Load sent log
    sent_data = {"sent": []}
    if os.path.exists(SENT_LOG):
        try:
            sent_data = json.loads(open(SENT_LOG, encoding="utf-8").read())
        except:
            pass
    sent_ids = {s["id"] for s in sent_data.get("sent", [])}
    
    # Load leads
    if not os.path.exists(CSV):
        print("No leads CSV found.")
        return 0
    
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Total leads: {len(rows)}, Already sent: {len(sent_ids)}")
    
    count = 0
    for r in rows:
        if count >= limit:
            break
        if r.get("status") == "verified_valid" and r["id"] not in sent_ids and r.get("email"):
            hotel = r.get("hotel_name", "Hotel")
            city = r.get("city", "USA")
            email = r["email"]
            
            # Anti-spam: plain text only, proper unsubscribe, no spammy subject
            subject = f"Direct Bookings & Mobile Website for {hotel}"
            body = f"""Hi Team at {hotel},

I noticed that {hotel} in {city} is missing a dedicated direct-booking website or your current online presence relies heavily on OTA commissions (Booking.com, Expedia).

We build high-converting, lightning-fast direct booking websites for boutique hotels in the US with zero commission fees, integrated Stripe payments, and instant WhatsApp/SMS booking widgets.

Would you be interested in seeing a free live demo website custom-built for {hotel} with your exact rooms and amenities? No obligation at all.

Best regards,
Ahmad
Direct Booking Website Agency
mithsjames87@gmail.com

---
This email was sent because we noticed {hotel} may benefit from a direct booking website.
If you are not the right person, please disregard this email.
To unsubscribe: reply with "unsubscribe" and we will remove you from our list.
"""
            msg = MIMEText(body)
            msg["To"] = email
            msg["Subject"] = subject
            msg["From"] = "Ahmad Raza <mithsjames87@gmail.com>"
            msg["Reply-To"] = "mithsjames87@gmail.com"
            msg["List-Unsubscribe"] = "<mailto:mithsjames87@gmail.com?subject=unsubscribe>"
            msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
            msg["X-Priority"] = "3"
            msg["X-Mailer"] = "Direct Booking Agency Outreach v1.0"
            
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            
            try:
                res = service.users().messages().send(userId="me", body={"raw": raw}).execute()
                print(f"  SENT: {hotel} <{email}> (ID: {res.get('id')})")
                r["status"] = "sent"
                sent_data["sent"].append({"id": r["id"], "hotel": hotel, "email": email, "date": datetime.now().strftime("%Y-%m-%d")})
                sent_ids.add(r["id"])
                count += 1
            except Exception as e:
                print(f"  FAIL: {hotel} <{email}> - {e}")
            time.sleep(3)
    
    # Save sent log
    with open(SENT_LOG, "w", encoding="utf-8") as f:
        json.dump(sent_data, f, indent=2)
    
    # Save CSV
    fields = list(rows[0].keys()) if rows else ["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"]
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Done. Sent {count} emails. Total sent: {len(sent_data['sent'])}")
    return count

if __name__ == "__main__":
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Auto-send batch started...")
    sent = send_batch(limit=20)
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Auto-send batch complete. Sent {sent} emails.")
