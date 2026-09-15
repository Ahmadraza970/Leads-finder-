#!/usr/bin/env python3
"""
us_serper_live.py - Serper live search for USA boutique hotels without websites.
"""
import csv, json, re, os, urllib.request, urllib.parse, time
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SERPER_KEY = os.environ.get("SERPER_KEY", "15a5d39e5a590b71065a97207ea026d1fe39d232")

USA_CITIES = [
    "New York", "Miami", "Los Angeles", "Las Vegas", "Orlando",
    "Austin", "Seattle", "Denver", "San Francisco", "Boston"
]

def s_search(q):
    d = json.dumps({"q": q, "num": 10}).encode()
    req = urllib.request.Request(
        "https://google.serper.dev/search",
        data=d,
        headers={"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())

def ext_email(text):
    emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    filtered = [e for e in emails if not any(x in e.lower() for x in ["example", "sentry", "png", "jpg", "jpeg", "wixpress"])]
    preferred = [e for e in filtered if any(k in e.lower() for k in ["info", "contact", "reservation", "booking", "sales", "hello", "frontdesk"])]
    return preferred[0] if preferred else (filtered[0] if filtered else "")

def ext_phone(text):
    phones = re.findall(r"\+1[\s\-]*\(?\d{3}\)?[\s\-]*\d{3}[\s\-]*\d{4}", text)
    return phones[0] if phones else ""

if __name__ == "__main__":
    if not os.path.exists(CSV):
        with open(CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"])
            writer.writeheader()
            
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    max_id = 0
    for r in rows:
        try:
            num = int(r["id"].split("-")[-1])
            if num > max_id: max_id = num
        except: pass
        
    seen = {(r["hotel_name"].lower(), r["city"].lower()) for r in rows}
    added = 0
    
    for city in USA_CITIES:
        print(f"[→] Serper live USA search: {city}")
        queries = [
            f"independent motels hotels {city} USA contact email phone",
            f"boutique guest house {city} no website email",
            f"small hotel {city} booking phone email"
        ]
        for q in queries:
            try:
                res = s_search(q)
                for item in res.get("organic", []):
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    
                    # Look for hotel-like title
                    if any(w in title.lower() for w in ["hotel", "motel", "inn", "suites", "lodge", "resort", "guest house"]):
                        name = title.split("-")[0].split("|")[0].strip()
                        key = (name.lower(), city.lower())
                        if key in seen: continue
                        
                        email = ext_email(snippet + " " + link)
                        phone = ext_phone(snippet)
                        
                        if email:
                            max_id += 1
                            lead_id = f"usa-hotel-{max_id:03d}"
                            rows.append({
                                "id": lead_id,
                                "hotel_name": name,
                                "city": city,
                                "phone": phone,
                                "email": email,
                                "website": link if "booking" not in link and "tripadvisor" not in link else "",
                                "status": "new",
                                "date_discovered": datetime.now().strftime("%Y-%m-%d"),
                                "audit_notes": "Found via Serper live search"
                            })
                            seen.add(key)
                            added += 1
            except Exception as e:
                print(f"Serper search error: {e}")
            time.sleep(1)
            
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id","hotel_name","city","phone","email","website","status","date_discovered","audit_notes"])
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Serper USA live search completed. Added {added} new leads.")
