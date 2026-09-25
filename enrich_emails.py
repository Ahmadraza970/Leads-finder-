#!/usr/bin/env python3
"""
enrich_emails.py - Serper-enrich missing emails for existing USA hotel leads.
Searches each lead by name + city, extracts email from results.
"""
import csv, json, re, os, urllib.request, urllib.parse, time
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERMES_DIR, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(HERMES_DIR, "sent_log_usa_hotels.json")
SERPER_KEYS = [
    os.environ.get("SERPER_KEY", "15a5d39e5a590b71065a97207ea026d1fe39d232"),
    "d0f391c08934a027ae79ef736de987af6a16de36",
]

def s_search(q):
    last_err = None
    for key in SERPER_KEYS:
        try:
            d = json.dumps({"q": q, "num": 10}).encode()
            req = urllib.request.Request(
                "https://google.serper.dev/search",
                data=d,
                headers={"X-API-KEY": key, "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:200]
            if "Not enough credits" in body or e.code == 402:
                last_err = e
                continue
            raise
        except Exception as e:
            last_err = e
            continue
    raise last_err or Exception("All Serper keys failed")

def ext_email(text):
    emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    filtered = [e for e in emails if not any(x in e.lower() for x in
        ["example", "sentry", "png", "jpg", "jpeg", "wixpress", "wordpress",
         "godaddy", "sitebuilder", "google", "facebook", "twitter", "instagram",
         "linkedin", "youtube", "tiktok", "pinterest", "reddit", "wordpress.com",
         "cloudflare", "squarespace", "wix.com", "weebly", "yola", "webnode"])]
    preferred = [e for e in filtered if any(k in e.lower() for k in
        ["info", "contact", "reservation", "booking", "sales", "hello",
         "frontdesk", "front", "desk", "reservations", "stay", "office"])]
    return preferred[0] if preferred else (filtered[0] if filtered else "")

def ext_phone(text):
    phones = re.findall(r"\+1[\s\-]*\(?\d{3}\)?[\s\-]*\d{3}[\s\-]*\d{4}", text)
    return phones[0] if phones else ""

def main():
    if not os.path.exists(CSV):
        print("No CSV found.")
        return

    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    print(f"Total leads: {len(rows)}")

    # Load sent IDs
    sent_ids = set()
    if os.path.exists(SENT_LOG):
        try:
            sent_ids = {s["id"] for s in json.load(open(SENT_LOG))["sent"]}
        except: pass
    print(f"Already sent: {len(sent_ids)}")

    # Find leads needing email enrichment: status=new, no email, not sent
    targets = [r for r in rows
               if r.get("status") == "new"
               and r.get("id") not in sent_ids
               and not r.get("email", "").strip()]

    print(f"Leads needing email enrichment: {len(targets)}")
    if not targets:
        print("Nothing to enrich.")
        return

    enriched = 0
    failed = 0

    for i, r in enumerate(targets):
        hotel = r.get("hotel_name", "").strip()
        city = r.get("city", "").strip()
        if not hotel:
            continue

        print(f"[{i+1}/{len(targets)}] {hotel} ({city})...", end=" ", flush=True)

        # Search queries
        queries = [
            f'"{hotel}" {city} email contact',
            f'"{hotel}" {city} reservation',
            f'{hotel} {city} official website',
        ]

        found_email = ""
        found_phone = r.get("phone", "")
        found_website = r.get("website", "")

        for q in queries:
            try:
                res = s_search(q)
                for item in res.get("organic", []):
                    text = item.get("title", "") + " " + item.get("snippet", "") + " " + item.get("link", "")
                    if not found_email:
                        found_email = ext_email(text)
                    if not found_phone:
                        found_phone = ext_phone(text)
                    if not found_website:
                        link = item.get("link", "")
                        if link and not any(x in link for x in ["booking", "tripadvisor", "expedia", "agoda", "hotels.com", "airbnb", "wikipedia"]):
                            found_website = link
                    if found_email:
                        break
                if found_email:
                    break
            except Exception as e:
                print(f"query error: {e}", end=" ", flush=True)
            time.sleep(0.5)

        if found_email:
            r["email"] = found_email
            if found_phone:
                r["phone"] = found_phone
            if found_website:
                r["website"] = found_website
            r["audit_notes"] = f"Email enriched via Serper on {datetime.now().strftime('%Y-%m-%d')}"
            print(f"✓ {found_email}")
            enriched += 1
        else:
            print(f"✗ no email found")
            failed += 1

        time.sleep(1)  # rate limit

    # Save
    fields = list(rows[0].keys())
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. Enriched: {enriched}, Failed: {failed}")
    print(f"Total leads with email now: {len([r for r in rows if r.get('email', '').strip()])}")

if __name__ == "__main__":
    main()