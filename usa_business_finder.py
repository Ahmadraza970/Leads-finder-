#!/usr/bin/env python3
"""USA Business Finder — discovers businesses needing websites via maps skill."""
import csv, json, os, sys, subprocess, time
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_OUTPUT = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
MAPS_SCRIPT = "C:/Users/AHMAD RAJA/AppData/Local/hermes/skills/productivity/maps/scripts/maps_client.py"

# Business categories to scan
CATEGORIES = [
    "restaurant", "cafe", "hotel", "guest_house",
    "clinic", "doctor", "dentist", "pharmacy",
    "salon", "laundry", "bakery", "convenience_store",
    "gym", "swimming_pool", "car_wash", "taxi",
    "bookshop", "supermarket", "bar"
]

USA_CITIES = [
    "New York", "Los Angeles", "Miami", "Las Vegas",
    "Orlando", "Austin", "Seattle", "Denver",
    "Chicago", "Boston", "San Francisco", "New Orleans"
]

def run_maps_nearby(city, category, limit=10):
    """Run maps nearby command and return results."""
    try:
        result = subprocess.run(
            ["python3", MAPS_SCRIPT, "nearby", "--near", city, "--category", category, "--limit", str(limit)],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            return []
        return json.loads(result.stdout).get("results", [])
    except Exception as e:
        print(f"  [maps] Error for {city}/{category}: {e}")
        return []

def has_website(biz):
    """Check if business has a website."""
    web = biz.get("website", "")
    return bool(web and web.strip() and not web.startswith("http://example"))

def is_ota_or_generic(web):
    """Check if website is just an OTA or generic listing."""
    if not web:
        return False
    ota_markers = ["booking.com", "expedia", "airbnb", "agoda", "tripadvisor", "yelp.com", "facebook.com", "instagram.com", "google.com/maps"]
    return any(m in web.lower() for m in ota_markers)

def save_business_leads(all_leads, city, category):
    """Save leads to CSV with Telegram notification."""
    FIELDNAMES = ["id", "business_name", "city", "category", "phone", "email", "website", "status", "date_discovered", "audit_notes"]
    
    existing = []
    if os.path.exists(CSV_OUTPUT):
        with open(CSV_OUTPUT, encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for r in reader:
                if r.get("id") and r["id"] != "id":
                    existing.append(r)
    
    seen = set((r.get("business_name", "").lower(), r.get("city", "").lower()) for r in existing)
    max_id = 0
    for r in existing:
        try:
            max_id = max(max_id, int(r["id"].split("-")[-1]))
        except:
            pass
    
    added = 0
    for lead in all_leads:
        key = (lead.get("name", "").lower(), city.lower())
        if key in seen:
            continue
        seen.add(key)
        max_id += 1
        lid = f"biz-lead-{max_id:04d}"
        web = lead.get("website", "")
        status = "Has website" if has_website(lead) else ("OTA only" if is_ota_or_generic(web) else "No website")
        
        existing.append({
            "id": lid,
            "business_name": lead.get("name", ""),
            "city": city,
            "category": category,
            "phone": lead.get("phone", ""),
            "email": "",
            "website": web,
            "status": status,
            "date_discovered": datetime.now().strftime("%Y-%m-%d"),
            "audit_notes": f"USA {category} in {city}. {status}."
        })
        added += 1
    
    with open(CSV_OUTPUT, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDNAMES)
        w.writeheader()
        w.writerows([{k: r.get(k, "") for k in FIELDNAMES} for r in existing])
    
    # Telegram notification
    try:
        sys.path.insert(0, HERMES_DIR)
        from telegram_notifier import send_message, load_config
        cfg = load_config()
        if cfg.get("bot_token") and cfg.get("chat_id") and added > 0:
            lines = [f"🏢 <b>USA Business Leads</b> — {city} / {category}"]
            lines.append(f"📊 Found: {len(all_leads)} | New: {added} | Total DB: {len(existing)}")
            if all_leads:
                lines.append("\n<b>Top leads:</b>")
                for lead in all_leads[:8]:
                    name = lead.get("name", "")
                    web = lead.get("website", "") or "no website"
                    lines.append(f"• {name} | {web}")
            text = "\n".join(lines)
            send_message(cfg["bot_token"], cfg["chat_id"], text)
    except Exception as e:
        print(f"  [Telegram] Error: {e}")
    
    return added, len(existing)

def main():
    import argparse
    p = argparse.ArgumentParser(description="USA Business Finder")
    p.add_argument("--city", default=None)
    p.add_argument("--category", default=None)
    p.add_argument("--limit", type=int, default=10)
    p.add_argument("--all", action="store_true")
    args = p.parse_args()
    
    if args.all:
        total_added = 0
        for city in USA_CITIES[:4]:  # Start with 4 cities
            for category in CATEGORIES[:5]:  # Start with 5 categories
                print(f"[→] Scanning {city} / {category}...")
                leads = run_maps_nearby(city, category, limit=args.limit)
                if leads:
                    added, total = save_business_leads(leads, city, category)
                    print(f"[✓] {city}/{category}: {len(leads)} found, {added} new, total {total}")
                    total_added += added
                time.sleep(1)  # Rate limit
        print(f"Done. Total added: {total_added}")
    elif args.city and args.category:
        leads = run_maps_nearby(args.city, args.category, limit=args.limit)
        added, total = save_business_leads(leads, args.city, args.category)
        print(f"{args.city}/{args.category}: {len(leads)} found, {added} new -> total {total}")
        for l in leads[:5]:
            print(f"  - {l.get('name')} | {l.get('website', 'no website')}")
    else:
        print("Use --city X --category Y or --all")

if __name__ == "__main__":
    main()
