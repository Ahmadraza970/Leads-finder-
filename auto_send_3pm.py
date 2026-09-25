#!/usr/bin/env python3
"""
auto_send_3pm.py - Auto-sends 20 cold emails daily at 3:00 PM IST.
Uses SMTP with Gmail app password. Reconnects per email to avoid drops.
"""
import os, json, csv, smtplib, ssl, time
from email.mime.text import MIMEText
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "mithsjames87@gmail.com"
EMAIL_PASSWORD = "dyqa yvty bopb nvzk"

def send_batch(limit=20):
    sent_data = {"sent": []}
    if os.path.exists(SENT_LOG):
        try:
            sent_data = json.loads(open(SENT_LOG, encoding="utf-8").read())
        except:
            pass
    sent_ids = {s["id"] for s in sent_data.get("sent", [])}

    if not os.path.exists(CSV):
        print("No leads CSV found.")
        return 0

    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Total leads: {len(rows)}, Already sent: {len(sent_ids)}")

    candidates = [r for r in rows if r.get("status") == "verified_valid" and r["id"] not in sent_ids and r.get("email")]
    if not candidates:
        candidates = [r for r in rows if r.get("status") == "new" and r["id"] not in sent_ids and r.get("email")]

    if not candidates:
        print("No candidates to send.")
        return 0

    print(f"Candidates: {len(candidates)}")

    context = ssl.create_default_context()
    count = 0

    for r in candidates[:limit]:
        hotel = r.get("hotel_name", "Hotel")
        city = r.get("city", "USA")
        email = r["email"]

        # Reconnect per email
        try:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
            server.ehlo()
            server.starttls(context=context)
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        except Exception as e:
            print(f"SMTP reconnect failed: {e}")
            break

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
        msg["From"] = f"Ahmad Raza <{EMAIL_ADDRESS}>"
        msg["Reply-To"] = EMAIL_ADDRESS
        msg["List-Unsubscribe"] = f"<mailto:{EMAIL_ADDRESS}?subject=unsubscribe>"
        msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
        msg["X-Priority"] = "3"
        msg["X-Mailer"] = "Direct Booking Agency Outreach v1.0"

        try:
            server.sendmail(EMAIL_ADDRESS, email, msg.as_string())
            print(f"  SENT: {hotel} <{email}>")
            r["status"] = "sent"
            sent_data["sent"].append({"id": r["id"], "hotel": hotel, "email": email, "date": datetime.now().strftime("%Y-%m-%d")})
            sent_ids.add(r["id"])
            count += 1
        except Exception as e:
            print(f"  FAIL: {hotel} <{email}> - {e}")

        try:
            server.quit()
        except:
            pass

        time.sleep(3)

    # Save sent log
    with open(SENT_LOG, "w", encoding="utf-8") as f:
        json.dump(sent_data, f, indent=2)

    # Save CSV
    fields = list(rows[0].keys()) if rows else ["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"]
    if "last_sent" not in fields:
        fields.append("last_sent")
        for r in rows:
            r["last_sent"] = ""
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Done. Sent {count} emails. Total sent: {len(sent_data['sent'])}")
    return count

if __name__ == "__main__":
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Auto-send batch started...")
    sent = send_batch(limit=20)
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Auto-send batch complete. Sent {sent} emails.")
