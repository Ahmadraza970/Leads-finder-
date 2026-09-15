import json, urllib.request, csv, os, time, re
from datetime import datetime

SERPER_KEY = "15a5d39e5a590b71065a97207ea026d1fe39d232"
CSV_PATH = "C:/Users/AHMAD RAJA/Desktop/hermes/usa_hotel_leads.csv"

with open(CSV_PATH) as f:
    existing_rows = list(csv.DictReader(f))

existing_names = set()
for r in existing_rows:
    existing_names.add(r['hotel_name'].lower().strip())

print(f"Existing leads: {len(existing_rows)}")
print(f"Existing unique names: {len(existing_names)}")

cities = [
    "Asheville NC", "Austin TX", "Napa CA", "Sedona AZ", "Santa Fe NM",
    "Charleston SC", "Savannah GA", "Boulder CO", "Palm Springs CA",
    "Portland OR", "Denver CO", "Nashville TN", "San Francisco CA",
    "New Orleans LA", "Key West FL", "Santa Barbara CA", "Fredericksburg TX",
    "Ojai CA", "Tybee Island GA", "Carmel CA", "Coronado CA", "Breckenridge CO",
    "Solvang CA", "Mackinac Island MI", "Cape Cod MA", "Galveston TX",
    "Hilton Head SC", "Orlando FL", "Seattle WA", "San Diego CA",
    "Los Angeles CA", "Chicago IL", "Miami FL", "Boston MA", "Las Vegas NV"
]

new_leads = []
seen = set()

for city in cities:
    if len(new_leads) >= 50:
        break
    
    queries = [
        f"boutique hotel {city} contact email reservations",
        f"independent hotel {city} direct booking website email"
    ]
    
    for query in queries:
        if len(new_leads) >= 50:
            break
            
        try:
            url = "https://google.serper.dev/search"
            payload = json.dumps({"q": query, "num": 8}).encode()
            req = urllib.request.Request(url, data=payload, headers={"X-API-KEY": "15a5d39e5a590b71065a97207ea026d1fe39d232", "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode())
            
            for item in result.get('organic', []):
                title = item.get('title', '').strip()
                snippet = item.get('snippet', '')
                link = item.get('link', '')
                
                name_lower = title.lower().strip()
                if name_lower in existing_names or name_lower in seen:
                    continue
                
                skip = ['booking.com', 'expedia', 'tripadvisor', 'agoda', 'hotels.com',
                        'airbnb', 'vrbo', 'wikipedia', 'blog', 'review', 'list of',
                        'chamber of commerce', 'best western', 'marriott', 'hilton',
                        'hyatt', 'holiday inn', 'courtyard', 'residence inn', 'hampton',
                        'doubletree', 'comfort inn', 'la quinta', 'drury', 'cambria',
                        'fairfield', 'radisson', 'clarion', 'home2', 'homewood', 'ramada',
                        'wingate', 'quality', 'red roof', 'super 8', 'motel 6', 'econo',
                        'mainstay', 'staybridge', 'candlewood', 'aloft', 'element', 'moxy',
                        'grand hyatt', 'andaz', 'alila', 'park hyatt', 'thompson',
                        'small luxury hotels', 'slh.com', 'concept restaurants']
                if any(w in name_lower for w in skip):
                    continue
                
                email = ""
                emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", snippet + " " + link)
                for e in emails:
                    domain = e.split('@')[1].lower()
                    if any(bad in domain for bad in ['example.com', 'sentry.io', 'google.com', 'facebook.com',
                                                      'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com',
                                                      'w3.org', 'schema.org', 'cloudflare.com', 'wordpress.com',
                                                      'godaddy.com', 'squarespace.com', 'wix.com']):
                        continue
                    if len(e) > 80:
                        continue
                    email = e
                    break
                
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
                    "email": email,
                    "website": link,
                    "status": "verified_valid" if email else "invalid_no_email",
                    "date_discovered": datetime.now().strftime("%Y-%m-%d"),
                    "audit_notes": "Serper batch discovery (new key)"
                })
                
                seen.add(name_lower)
                if email:
                    print(f"  + {title[:55]} -> {email}")
                else:
                    print(f"  - {title[:55]} (no email)")
            
            time.sleep(0.3)
        except Exception as e:
            print(f"  Error for {city}: {e}")

print(f"\nDiscovered {len(new_leads)} new leads")

all_rows = existing_rows + new_leads

fields = ["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"]
with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(all_rows)

print(f"Total leads now: {len(all_rows)}")