#!/usr/bin/env python3
"""
usa_hotel_agent_fixed.py - Fixed USA hotel discovery via Overpass API (curl-based, SSL-safe).
Uses curl subprocess to avoid Python SSL issues with Overpass.
"""
import csv, json, os, sys, subprocess, time, re
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_OUTPUT = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")

USA_CITIES = [
    ("New York", "40.47,-74.25,40.92,-73.70"),
    ("Los Angeles", "33.9,-118.4,34.3,-118.1"),
    ("Miami", "25.6,-80.3,25.9,-80.1"),
    ("Las Vegas", "36.0,-115.3,36.3,-115.0"),
    ("Orlando", "28.4,-81.5,28.7,-81.2"),
    ("Chicago", "41.6,-87.9,42.1,-87.5"),
    ("San Francisco", "37.6,-122.6,37.9,-122.3"),
    ("Austin", "30.2,-97.9,30.5,-97.6"),
    ("New Orleans", "29.9,-90.2,30.1,-89.8"),
    ("Seattle", "47.5,-122.5,47.8,-122.2"),
    ("Boston", "42.2,-71.2,42.4,-70.9"),
    ("Denver", "39.6,-105.1,39.8,-104.9"),
    ("San Diego", "32.6,-117.2,32.9,-116.9"),
    ("Nashville", "36.0,-86.9,36.3,-86.6"),
    ("Savannah", "32.0,-81.1,32.2,-80.8"),
]

def overpass_query(bbox, timeout=20):
    """Query Overpass API using curl (SSL-safe)."""
    south, west, north, east = bbox
    query = f"""[out:json][timeout:{timeout}];
(
  node["tourism"~"hotel|motel|guest_house|inn|hostel"]({south},{west},{north},{east});
  way["tourism"~"hotel|motel|guest_house|inn|hostel"]({south},{west},{north},{east});
);
out body;"""
    
    result = subprocess.run([
        "curl", "-s", "--max-time", str(timeout + 10),
        "-X", "POST", "https://overpass-api.de/api/interpreter",
        "-d", f"data={query}",
        "-H", "User-Agent: HermesUSAHotelAgent/2.0"
    ], capture_output=True, text=True, timeout=timeout + 15)
    
    if result.returncode != 0:
        return []
    
    try:
        # Find JSON in response
        raw = result.stdout
        idx = raw.find('{')
        if idx < 0:
            return []
        data = json.loads(raw[idx:])
        return data.get("elements", [])
    except:
        return []

def extract_hotels(elements, city):
    """Extract hotel info from Overpass elements."""
    hotels = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        
        website = tags.get("website", tags.get("contact:website", ""))
        email = tags.get("email", tags.get("contact:email", ""))
        phone = tags.get("phone", tags.get("contact:phone", ""))
        
        hotels.append({
            "hotel_name": name,
            "city": city,
            "phone": phone,
            "email": email,
            "website": website,
            "has_website": bool(website)
        })
    return hotels

def save_leads(hotels):
    """Save new leads to CSV, avoiding duplicates."""
    if not os.path.exists(CSV_OUTPUT):
        with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "id","hotel_name","city","phone","email","website","status",
                "date_discovered","audit_notes"
            ])
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
        if key in seen:
            continue
        
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
        writer = csv.DictWriter(f, fieldnames=[
            "id","hotel_name","city","phone","email","website","status",
            "date_discovered","audit_notes"
        ])
        writer.writeheader()
        writer.writerows(rows)
    
    return added, len(rows)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--city", default=None)
    parser.add_argument("--limit", type=int, default=30)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    
    if args.all:
        total_added = 0
        for city, bbox_str in USA_CITIES:
            bbox = bbox_str.split(",")
            print(f"Scanning {city}...")
            elements = overpass_query(bbox)
            hotels = extract_hotels(elements, city)
            added, total = save_leads(hotels)
            print(f"  -> {len(hotels)} found, {added} new, DB: {total}")
            time.sleep(2)
        print(f"\nTotal new added: {total_added}")
    elif args.city:
        # Find bbox for city
        city_bbox = {c[0]: c[1].split(",") for c in USA_CITIES}
        bbox = city_bbox.get(args.city)
        if not bbox:
            print(f"Unknown city: {args.city}")
            sys.exit(1)
        elements = overpass_query(bbox)
        hotels = extract_hotels(elements, args.city)
        added, total = save_leads(hotels)
        print(f"{args.city}: {len(hotels)} found, {added} new, DB: {total}")
    else:
        print("Usage: python usa_hotel_agent_fixed.py --all OR --city 'New York'")