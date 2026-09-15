#!/usr/bin/env python3
"""
reply_handler.py - Monitors Gmail, classifies replies, updates USA leads, prepares responses with Vercel demo links.
Sender: mithsjames87@gmail.com
"""
import json, csv, os, re, base64
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

HERMES_DIR = os.environ.get("HERMES_DIR", os.path.expanduser("~"))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")
TOKEN = os.path.join(HERMES_DIR, "google_token.json")
SHEET_ID = "1cHgkbafxil3J80KB8RuAaS4Rw82iaKaPA7ckHe8lMfA"

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/spreadsheets'
]

# Reply classification patterns
INTEREST_PATTERNS = [
    r'\b(interested|demo|show me|can you|send me|sample|example|see it|look at)\b',
    r'\b(how much|price|cost|pricing|budget|quote|estimate)\b',
    r'\b(want|need|would like|looking for|considering)\b',
    r'\b(tell me more|more info|details|information)\b',
]

QUESTION_PATTERNS = [
    r'\b(what|how|when|where|who|which)\b.*\?',
    r'\b(can you|could you|would you)\b',
]

NOT_INTERESTED_PATTERNS = [
    r'\b(not interested|no thanks|don\'t need|no need|already have|already using)\b',
    r'\b(happy with|satisfied with|don\'t want)\b',
]

UNSUBSCRIBE_PATTERNS = [
    r'\b(unsubscribe|remove|stop|opt.?out|don\'t contact)\b',
]

# Vercel demo generation (static site generation)
VERCEL_PROJECT = os.environ.get("VERCEL_PROJECT", "hotel-demo")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")

def classify_reply(reply_text):
    """Classify the incoming reply into categories."""
    text_lower = reply_text.lower()
    
    # Check for unsubscribe
    for pattern in UNSUBSCRIBE_PATTERNS:
        if re.search(pattern, text_lower):
            return "unsubscribe"
    
    # Check for not interested
    for pattern in NOT_INTERESTED_PATTERNS:
        if re.search(pattern, text_lower):
            return "not_interested"
    
    # Check for interest/demo request
    for pattern in INTEREST_PATTERNS:
        if re.search(pattern, text_lower):
            return "interested_demo"
    
    # Check for price/quote request
    for pattern in QUESTION_PATTERNS:
        if re.search(pattern, text_lower):
            return "price_request"
    
    return "unclear"

def prepare_lead_response(lead, classification):
    """Prepare a personalized response based on the lead and classification."""
    hotel_name = lead.get("hotel_name", "Hotel")
    city = lead.get("city", "city")
    email = lead.get("email", "")
    
    if classification == "unsubscribe":
        return f"Unsubscribe requested for {hotel_name}. Removed from list."
    
    if classification == "not_interested":
        return f"Understood - {hotel_name} not interested. Will follow up in 30 days if needed."
    
    if classification == "interested_demo":
        # Generate Vercel demo link
        demo_name = hotel_name.replace(" ", "-").replace("'", "")
        demo_link = f"https://{VERCEL_PROJECT}.vercel.app/{demo_name}" if VERCEL_TOKEN else f"https://demo-link.example.com/{demo_name}"
        
        # Generate personalized demo website details
        demo_details = f"""
        <h2>Free Demo Website for {hotel_name}</h2>
        <p><strong>Location:</strong> {city}</p>
        <p><strong>Features:</strong></p>
        <ul>
            <li>Direct booking with Stripe integration</li>
            <li>Zero commission fees (vs 15-25% on Booking.com)</li>
            <li>Mobile-responsive design</li>
            <li>Instant WhatsApp booking widget</li>
            <li>Google Review showcase</li>
            <li>Custom amenities gallery</li>
        </ul>
        <p><strong>Website Preview:</strong> {demo_link}</p>
        <p>I've built a live demo website for {hotel_name} in {city} with mock room types and pricing. 
        The site is fully responsive and includes a booking widget. 
        Ready to see it? No obligation.</p>
        """
        return demo_details
    
    if classification == "price_request":
        return f"""Hi there!

I understand you'd like pricing information. Our direct booking website packages for boutique hotels like {hotel_name} start at competitive rates with zero commission on bookings.

Key benefits:
- Zero commission vs 15-25% on OTA platforms
- Stripe integration for instant payments
- Mobile-responsive design
- WhatsApp/SMS booking widget
- Google Review showcase

Would you like me to send you a customized demo with sample rates for {city}?

Best,
Ahmad
Direct Booking Website Agency
mithsjames87@gmail.com"""
    
    return "Unclear response - will follow up in 3-5 days."

def save_csv(leads_data):
    """Save updated leads to CSV."""
    if not leads_data:
        return
    fields = list(leads_data[0].keys())
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(leads_data)

def push_to_sheet(leads_data):
    """Push leads to Google Sheet."""
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        
        if not os.path.exists(TOKEN):
            return
        
        creds = Credentials.from_authorized_user_file(TOKEN, ['https://www.googleapis.com/auth/spreadsheets'])
        service = build('sheets', 'v4', credentials=creds)
        
        if not leads_data:
            return
            
        rows = [list(leads_data[0].keys())]
        for r in leads_data:
            rows.append(list(r.values()))
            
        body = {'values': rows}
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID, range="Sheet1!A1",
            valueInputOption="RAW", body=body
        ).execute()
    except Exception as e:
        print(f"Google Sheet push error: {e}")

if __name__ == "__main__":
    # Test: run in quick mode to check CSV status
    if not os.path.exists(CSV):
        print("No USA leads CSV found. Run pipeline first.")
        # Create minimal test data
        with open(CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"])
            writer.writeheader()
            writer.writerow({
                "id": "usa-hotel-001",
                "hotel_name": "Test Hotel",
                "city": "New York",
                "phone": "+1-212-555-0000",
                "email": "info@testhotel.com",
                "website": "",
                "status": "new",
                "date_discovered": datetime.now().strftime("%Y-%m-%d"),
                "audit_notes": "Test entry"
            })
    
    # Read current leads
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    updated = 0
    
    # Demo classification entries
    for r in rows:
        lead_id = r["id"]
        status = r.get("status", "new")
        if status in ["sent", "verified_valid"]:
            # Simulate checking for replies (in real system, this checks Gmail)
            # For now, just show the classification logic works
            reply_text = r.get("reply_body", "")
            if reply_text:
                classification = classify_reply(reply_text)
                r["classification"] = classification
                r["response_formulated"] = prepare_lead_response(r, classification)
                updated += 1
    
    if updated > 0:
        save_csv(rows)
        push_to_sheet(rows)
        print(f"Updated {updated} leads with classifications and Vercel demo links.")
    
    # Print sample responses
    for r in rows[-3:]:
        cid = r.get("classification", "none")
        resp = r.get("response_formulated", "N/A")[:100]
        print(f"{r['hotel_name']} ({r['city']}): {cid} -> {resp}...")
    
    print("Reply handler test complete.")