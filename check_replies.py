#!/usr/bin/env python3
"""
check_replies.py - Check Gmail inbox for replies to outreach emails.
Classifies each reply and updates the CSV + sent log.
Uses direct HTTP calls with the stored access token.
"""
import os, json, csv, base64, re, time, urllib.request, urllib.error
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")
TOKEN_FILE = os.path.join(HERMES_DIR, "google_token.json")

GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly"

def get_valid_token():
    """Get a valid access token, refreshing if needed."""
    if not os.path.exists(TOKEN_FILE):
        print("No token file. Run: python oauth_gmail.py")
        return None

    with open(TOKEN_FILE) as f:
        t = json.load(f)

    # Check if we have gmail scope
    if GMAIL_SCOPE not in t.get("scopes", []):
        print(f"Gmail scope missing. Token scopes: {t.get('scopes')}")
        print("Run: python oauth_gmail.py")
        return None

    # Check if token is expired
    expiry = t.get("expiry", 0)
    if isinstance(expiry, str):
        try:
            expiry = datetime.fromisoformat(expiry.replace("Z", "+00:00")).timestamp()
        except:
            expiry = 0

    if time.time() > expiry:
        # Refresh token
        print("Token expired, refreshing...")
        data = urllib.parse.urlencode({
            "client_id": t["client_id"],
            "client_secret": t["client_secret"],
            "refresh_token": t["refresh_token"],
            "grant_type": "refresh_token",
        }).encode()
        try:
            req = urllib.request.Request(
                t["token_uri"], data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            resp = urllib.request.urlopen(req)
            tokens = json.loads(resp.read())
            t["token"] = tokens["access_token"]
            t["expiry"] = time.time() + tokens.get("expires_in", 3600)
            with open(TOKEN_FILE, "w") as f:
                json.dump(t, f, indent=2)
            print("Token refreshed.")
        except Exception as e:
            print(f"Token refresh failed: {e}")
            return None

    return t["token"]

def gmail_api(token, path):
    """Make a GET request to Gmail API."""
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/{path}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"Gmail API error: {e.code} {e.read().decode()[:200]}")
        return None

def classify_reply(body, subject):
    text = (body + " " + subject).lower()
    if any(w in text for w in ["unsubscribe", "not interested", "no thanks", "stop", "remove me", "opt out"]):
        return "UNSUBSCRIBE"
    if any(w in text for w in ["not the right person", "wrong person", "not responsible", "not the owner", "not the contact"]):
        return "WRONG_PERSON"
    if any(w in text for w in ["demo request", "free demo", "sample", "trial", "show me the demo"]):
        return "DEMO_REQUEST"
    if any(w in text for w in ["interested", "yes", "would love", "sounds good", "let's talk", "call me", "schedule", "meeting", "tell me more"]):
        return "INTERESTED"
    if any(w in text for w in ["price", "cost", "how much", "quote", "budget", "pricing", "rate"]):
        return "PRICE_REQUEST"
    return "UNCLEAR"

def check_replies():
    token = get_valid_token()
    if not token:
        return

    # Search for inbound messages
    result = gmail_api(token, "messages?q=is:inbound&maxResults=50")
    if not result:
        print("No messages or API error.")
        return

    messages = result.get("messages", [])
    print(f"Found {len(messages)} inbound messages.")

    if not messages:
        print("No new replies.")
        return

    # Load sent log
    sent_data = {"sent": []}
    if os.path.exists(SENT_LOG):
        try:
            sent_data = json.loads(open(SENT_LOG, encoding="utf-8").read())
        except:
            pass
    sent_emails = {s["email"].lower(): s for s in sent_data["sent"]}

    # Load CSV
    rows = list(csv.DictReader(open(CSV, encoding="utf-8"))) if os.path.exists(CSV) else []
    updated = 0

    for msg in messages:
        msg_id = msg["id"]
        msg_data = gmail_api(token, f"messages/{msg_id}?format=full")
        if not msg_data:
            continue

        headers = msg_data.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "(no subject)")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "")

        email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', sender)
        if not email_match:
            continue
        reply_email = email_match.group(0).lower()

        # Get body
        body = ""
        payload = msg_data.get("payload", {})
        b = payload.get("body", {})
        if "data" in b:
            body = base64.urlsafe_b64decode(b["data"]).decode("utf-8", errors="ignore")
        elif "parts" in payload:
            for part in payload["parts"]:
                pb = part.get("body", {})
                if part.get("mimeType") == "text/plain" and "data" in pb:
                    body = base64.urlsafe_b64decode(pb["data"]).decode("utf-8", errors="ignore")
                    break

        category = classify_reply(body, subject)

        if reply_email in sent_emails:
            sent_entry = sent_emails[reply_email]
            sent_entry["status"] = category
            sent_entry["reply_subject"] = subject
            sent_entry["reply_date"] = datetime.now().strftime("%Y-%m-%d")
            print(f"  {category}: {sent_entry['hotel']} <{reply_email}> | {subject[:60]}")
            updated += 1

            for r in rows:
                if r["id"] == sent_entry["id"]:
                    r["status"] = category
                    r["audit_notes"] = f"Replied: {category} | {subject[:80]}"
        else:
            print(f"  UNKNOWN SENDER: {reply_email} | {subject[:60]}")

    # Save
    with open(SENT_LOG, "w", encoding="utf-8") as f:
        json.dump(sent_data, f, indent=2)

    if rows:
            fields = list(rows[0].keys())
            if "last_sent" not in fields:
                fields.append("last_sent")
                for r in rows:
                    r["last_sent"] = ""
            with open(CSV, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(rows)

    print(f"Done. Classified {updated} replies.")

if __name__ == "__main__":
    check_replies()