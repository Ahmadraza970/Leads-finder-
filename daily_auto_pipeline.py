#!/usr/bin/env python3
"""
daily_auto_pipeline.py - Full auto USA hotel pipeline for Hermes
Runs: find USA hotels -> Serper enrich -> strict MX verify -> push to Google Sheet -> Gmail send (verified only) -> wait for replies
Sender: mithsjames87@gmail.com
Sheet ID: 1cHgkbafxil3J80KB8RuAaS4Rw82iaKaPA7ckHe8lMfA
"""
import csv, json, os, re, time, base64, subprocess, sys, tempfile
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import urllib.request, urllib.parse

HERMES_DIR = os.environ.get("HERMES_DIR", r"C:\Users\AHMAD RAJA\Desktop\hermes")
if not os.path.exists(HERMES_DIR):
    HERMES_DIR = os.path.dirname(os.path.abspath(__file__))

CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SHEET_ID = "1cHgkbafxil3J80KB8RuAaS4Rw82iaKaPA7ckHe8lMfA"
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")
SERPER_KEY = os.environ.get("SERPER_KEY", "d0f391c08934a027ae79ef736de987af6a16de36")
GOOGLE_TOKEN = os.path.join(HERMES_DIR, "google_token.json")

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def refresh_token():
    """Refresh Google OAuth token if expired."""
    with open(GOOGLE_TOKEN, encoding="utf-8") as f:
        token = json.load(f)
    with open(os.path.join(HERMES_DIR, "client_secret.json"), encoding="utf-8") as f:
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
        log("No leads CSV found.")
        return 0
    
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    log(f"Total leads: {len(rows)}, Already sent: {len(sent_ids)}")
    
    count = 0
    for r in rows:
        if count >= limit:
            break
        if r.get("status") == "verified_valid" and r["id"] not in sent_ids and r.get("email"):
            hotel = r.get("hotel_name", "Hotel")
            city = r.get("city", "USA")
            email = r["email"]
            
            subject = f"Direct Bookings & Mobile Website for {hotel}"
            body = f"""Hi Team at {hotel},

I noticed that {hotel} in {city} is missing a dedicated direct-booking website or your current online presence relies heavily on OTA commissions (Booking.com, Expedia).

We build high-converting, lightning-fast direct booking websites for boutique hotels in the US with zero commission fees, integrated Stripe payments, and instant WhatsApp/SMS booking widgets.

Would you be interested in seeing a free live demo website custom-built for {hotel} with your exact rooms and amenities? No obligation at all.

Best regards,
Ahmad
Direct Booking Website Agency
mithsjames87@gmail.com
"""
            msg = MIMEText(body)
            msg["To"] = email
            msg["Subject"] = subject
            msg["From"] = "mithsjames87@gmail.com"
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            
            try:
                res = service.users().messages().send(userId="me", body={"raw": raw}).execute()
                log(f"  SENT: {hotel} <{email}> (ID: {res.get('id')})")
                r["status"] = "sent"
                sent_data["sent"].append({"id": r["id"], "hotel": hotel, "email": email, "date": datetime.now().strftime("%Y-%m-%d")})
                sent_ids.add(r["id"])
                count += 1
            except Exception as e:
                log(f"  FAIL: {hotel} <{email}> - {e}")
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
    
    log(f"Done. Sent {count} emails. Total sent: {len(sent_data['sent'])}")
    return count

if __name__ == "__main__":
    log("=== Daily Auto Send Batch START ===")
    sent = send_batch(limit=20)
    log(f"=== Daily Auto Send Batch END - Sent {sent} emails ===")
