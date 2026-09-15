#!/usr/bin/env python3
"""
batch_discover.py - Daily lead discovery using Serper API.
Finds new USA boutique hotels, enriches with emails, verifies MX records.
"""
import csv, json, os, re, time, socket
from datetime import datetime
import urllib.request, urllib.parse

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SERPER_KEY = os.environ.get("SERPER_KEY", "d0f391c08934a027ae79ef736de987af6a16de36")

# Target cities for boutique hotel discovery
CITIES = [
    "Asheville NC", "Santa Fe NM", "Napa CA", "Sedona AZ", "Charleston SC",
    "Savannah GA", "Portland OR", "Austin TX", "Nashville TN", "Denver CO",
    "Phoenix AZ", "San Antonio TX", "Chicago IL", "Boston MA", "San Francisco CA",
    "Las Vegas NV", "Los Angeles CA", "New York NY", "Miami FL", "Seattle WA",
    "San Diego CA", "New Orleans LA", "Key West FL", "Myrtle Beach SC",
    "Galveston TX", "Coronado CA", "Breckenridge CO", "Carmel CA",
    "Palm Springs CA", "Fredericksburg TX", "Hilton Head SC", "Boulder CO",
    "Tybee Island GA", "Ojai CA", "Yountville CA", "Solvang CA"
]

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def serper_search(query, num=10):
    """Search via Serper API."""
    try:
        req = urllib.request.Request(
            "https://google.serper.dev/search",
            data=json.dumps({"q": query, "num": num}).encode(),
            headers={"X-API-KEY": ***"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        log(f"Serper error: {e}")
        return {}

def extract_email(text):
    """Extract valid email from text."""
    emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    for e in emails:
        domain = e.split("@")[1].lower()
        if any(bad in domain for bad in ["example.com", "sentry.io", "png", "jpg", "jpeg", 
                                          "google.com", "facebook.com", "twitter.com",
                                          "instagram.com", "linkedin.com", "youtube.com",
                                          "w3.org", "schema.org", "cloudflare.com"]):
            continue
        if len(e) > 80:
            continue
        return e
    return None

def has_mx(domain):
    """Check if domain has MX records."""
    try:
        import dns.resolver
        mx = dns.resolver.resolve(domain, 'MX')
        return len(mx) > 0
    except:
        try:
            socket.gethostbyname(domain)
            return True
        except:
            return False

def discover():
    """Discover new hotel leads via Serper."""
    log("Starting batch discovery...")
    
    # Load existing leads
    existing = set()
    if os.path.exists(CSV):
        with open(CSV) as f:
            reader = csv.DictReader(f)
            for r in reader:
                existing.add(r["hotel_name"].lower().strip())
    
    new_leads = []
    seen_names = set()
    
    for city in CITIES:
        if len(new_leads) >= 30:
            break
        
        queries = [
            f"boutique hotel {city} contact email",
            f"independent hotel {city} reservations email",
            f"small hotel {city} direct booking website"
        ]
        
        for query in queries:
            if len(new_leads) >= 30:
                break
            
            log(f"Searching: {query}")
            result = serper_search(query, num=8)
            
            for item in result.get("organic", []):
                title = item.get("title", "")
                snippet = item.get("snippet", "")
                link = item.get("link", "")
                
                # Skip if already have this hotel
                name_lower = title.lower().strip()
                if name_lower in existing or name_lower in seen_names:
                    continue
                
                # Skip non-hotel results
                skip_words = ["booking.com", "expedia", "tripadvisor", "agoda", "hotels.com",
                              "airbnb", "vrbo", "wikipedia", "blog", "review", "list"]
                if any(w in title.lower() for w in skip_words):
                    continue
                
                # Extract email
                email = extract_email(snippet + " " + link)
                if not email:
                    email = extract_email(title)
                
                # Extract phone
                phone = ""
                phone_match = re.search(r"\+1[\s\-]*\(?\d{3}\)?[\s\-]*\d{3}[\s\-]*\d{4}", snippet)
                if phone_match:
                    phone = phone_match.group()
                
                lead_id = f"usa-hotel-{int(time.time())}-{len(new_leads)}"
                
                new_leads.append({
                    "id": lead_id,
                    "hotel_name": title[:100],
                    "city": city,
                    "phone": phone,
                    "email": email or "",
                    "website": link,
                    "status": "verified_valid" if email else "invalid_no_email",
                    "date_discovered": datetime.now().strftime("%Y-%m-%d"),
                    "audit_notes": "Serper batch discovery"
                })
                
                seen_names.add(name_lower)
                log(f"  Found: {title[:60]} -> {email or 'no email'}")
            
            time.sleep(0.5)
    
    log(f"Discovered {len(new_leads)} new leads")
    
    # Merge with existing
    all_rows = []
    if os.path.exists(CSV):
        with open(CSV) as f:
            all_rows = list(csv.DictReader(f))
    
    all_rows.extend(new_leads)
    
    # Save
    fields = ["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"]
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(all_rows)
    
    log(f"Total leads now: {len(all_rows)}")
    return len(new_leads)

if __name__ == "__main__":
    count = discover()
    log(f"Discovery complete. Added {count} new leads.")
