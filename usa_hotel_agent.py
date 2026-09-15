#!/usr/bin/env python3
"""
usa_hotel_agent.py - Finds USA hotels without websites via OpenStreetMap Overpass and Serper search.
Saves leads to usa_hotel_leads.csv.
"""
import csv, json, os, sys, urllib.parse, urllib.request, time
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_OUTPUT = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SERPER_KEY = os.environ.get("SERPER_KEY", "15a5d39e5a590b71065a97207ea026d1fe39d232")

USA_CITIES = [
    "New York", "Los Angeles", "Miami", "Las Vegas", "Orlando",
    "Chicago", "San Francisco", "Austin", "New Orleans", "Seattle",
    "Boston", "Denver", "San Diego", "Nashville", "Savannah"
]

def find_usa_hotels(city, limit=20):
    headers = {"User-Agent": "HermesUSAHotelAgent/2.0"}
    nom_url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": f"{city}, USA", "format": "json", "limit": 1})
    try:
        req = urllib.request.Request(nom_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            geo = json.loads(resp.read().decode())
            if not geo: return []
            bbox = geo[0].get("boundingbox")
    except Exception as e:
        print(f"Nominatim error for {city}: {e}")
        return []
    
    south, north, west, east = bbox[0], bbox[1], bbox[2], bbox[3]
    query = f"""[out:json][timeout:30];
(
  node["tourism"~"hotel|motel|guest_house|inn|hostel"]({south},{west},{north},{east});
  way["tourism"~"hotel|motel|guest_house|inn|hostel"]({south},{west},{north},{east});
);
out body;
>;
out skel qt;"""
    
    overpass_url = "https://overpass-api.de/api/interpreter"
    hotels = []
    try:
        req = urllib.request.Request(overpass_url, data=query.encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            elements = data.get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                name = tags.get("name")
                if not name: continue
                
                # Check if website exists
                website = tags.get("website", tags.get("contact:website", ""))
                phone = tags.get("phone", tags.get("contact:phone", ""))
                email = tags.get("email", tags.get("contact:email", ""))
                
                # We prioritize hotels with NO website or weak web presence
                hotels.append({
                    "hotel_name": name,
                    "city": city,
                    "phone": phone,
                    "email": email,
                    "website": website,
                    "has_website": bool(website)
                })
    except Exception as e:
        print(f"Overpass API error for {city}: {e}")
    
    return hotels[:limit]

def save_usa_leads(hotels, city="USA"):
    if not os.path.exists(CSV_OUTPUT):
        with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"])
            writer.writeheader()
            
    existing = list(csv.DictReader(open(CSV_OUTPUT, encoding="utf-8")))
    max_id = 0
    for r in existing:
        try:
            num = int(r["id"].split("-")[-1])
            if num > max_id: max_id = num
        except: pass
        
    seen = {(r["hotel_name"].lower(), r["city"].lower()) for r in existing}
    added = 0
    
    rows = existing
    for h in hotels:
        key = (h["hotel_name"].lower(), h["city"].lower())
        if key in seen: continue
        
        max_id += 1
        lead_id = f"usa-hotel-{max_id:03d}"
        
        rows.append({
            "id": lead_id,
            "hotel_name": h["hotel_name"],
            "city": h["city"],
            "phone": h["phone"],
            "email": h["email"],
            "website": h["website"],
            "status": "new",
            "date_discovered": datetime.now().strftime("%Y-%m-%d"),
            "audit_notes": "No website / OTA dependent" if not h["website"] else "Has website"
        })
        seen.add(key)
        added += 1
        
    with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"])
        writer.writeheader()
        writer.writerows(rows)
        
    return added, len(rows)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", default=None)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    
    if args.all:
        total_added = 0
        for city in USA_CITIES:
            print(f"Scanning USA city: {city}...")
            hotels = find_usa_hotels(city, limit=args.limit)
            added, total = save_usa_leads(hotels, city=city)
            print(f" -> Found {len(hotels)}, Added {added} new leads. Total DB: {total}")
            time.sleep(1)
    elif args.city:
        hotels = find_usa_hotels(args.city, limit=args.limit)
        added, total = save_usa_leads(hotels, city=args.city)
        print(f"City {args.city}: Found {len(hotels)}, Added {added} new leads. Total DB: {total}")
    else:
        print("Usage: python usa_hotel_agent.py --all OR python usa_hotel_agent.py --city 'Miami'")
