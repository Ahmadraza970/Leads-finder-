#!/usr/bin/env python3
"""
daily_lead_digest.py — Daily Lead Digest for Ahmad Digital Studio.

WHAT IT DOES (and only this):
  1. Reads the lead CSVs already in this repo.
  2. Merges and de-duplicates them into one master list.
  3. Optionally discovers a few new hotels via the Serper API
     (only when SERPER_API_KEY is set — discovery + scoring ONLY).
  4. Scores every lead 0–100 with the studio's model:
       Fit 25 · Website-problem evidence 25 · Need likelihood 20
       Validated contact 15 · Personalisation data 15
  5. Writes outputs/leads_master.csv and outputs/daily_digest.md.

WHAT IT NEVER DOES:
  No email is sent. No SMTP, no Gmail API, no messages of any kind.
  Outreach for Ahmad Digital Studio is drafted for human approval and
  sent manually — automation stops at research, exactly as it should.

Runs on the Python standard library only — no pip installs in CI.
"""

import csv
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO, "outputs")
MASTER_CSV = os.path.join(OUT_DIR, "leads_master.csv")
DIGEST_MD = os.path.join(OUT_DIR, "daily_digest.md")
QUERIES_FILE = os.path.join(REPO, "pipeline", "queries.txt")

SOURCE_FILES = [
    # (filename, {target_field: source_column})
    ("usa_hotel_leads.csv", {
        "business": "hotel_name", "city": "city", "phone": "phone",
        "email": "email", "website": "website", "status": "status",
        "date_discovered": "date_discovered", "notes": "audit_notes",
        "last_sent": "last_sent",
    }),
    ("usa_hotel_leads_export.csv", {
        "business": "hotel_name", "city": "city", "phone": "phone",
        "email": "email", "website": "website", "status": "status",
        "date_discovered": "date_discovered", "notes": "audit_notes",
    }),
    ("google_sheets_leads.csv", {
        "business": "Name", "email": "Email", "phone": "Phone",
        "website": "Website", "city": "Address", "rating": "Rating",
        "reviews": "Rating Count", "type": "Type",
    }),
]

CHAINS = [
    "marriott", "hilton", "holiday inn", "best western", "comfort inn",
    "hampton", "hyatt", "sheraton", "wyndham", "motel 6", "super 8",
    "days inn", "la quinta", "quality inn", "econo lodge", "red roof",
    "choice hotels", "travelodge", "premier inn", "ibis", "radisson",
    "ramada", "fairfield", "courtyard", "doubletree", "embassy suites",
]
HOTEL_WORDS = [
    "hotel", "motel", "inn", "b&b", "bed and breakfast", "guest house",
    "guesthouse", "lodge", "resort", "hostel", "suites", "stay",
]
PROBLEM_WORDS = [
    "no booking", "no direct", "ota", "commission", "outdated", "old site",
    "slow", "not mobile", "no website", "facebook only", "broken",
]
CONTACTED_STATUSES = {"sent", "emailed", "contacted", "replied", "closed", "won", "lost"}


def clean(v):
    return (v or "").strip()


def domain_of(url):
    u = clean(url).lower()
    u = re.sub(r"^https?://", "", u)
    u = re.sub(r"^www\.", "", u)
    return u.split("/")[0].split("?")[0]


def norm_name(name):
    n = clean(name).lower()
    n = re.sub(r"[^a-z0-9 ]", "", n)
    return re.sub(r"\s+", " ", n).strip()


def load_existing_master_keys():
    keys = set()
    if os.path.exists(MASTER_CSV):
        with open(MASTER_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                keys.add(dedupe_key(row))
    return keys


def dedupe_key(lead):
    d = domain_of(lead.get("website", ""))
    if d:
        return "web:" + d
    e = clean(lead.get("email", "")).lower()
    if e:
        return "email:" + e
    return "name:" + norm_name(lead.get("business", "")) + "|" + norm_name(lead.get("city", ""))[:24]


def read_sources():
    leads = []
    for fname, mapping in SOURCE_FILES:
        path = os.path.join(REPO, fname)
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                lead = {k: clean(row.get(col, "")) for k, col in mapping.items()}
                if not lead.get("business"):
                    continue
                lead["source"] = fname
                leads.append(lead)
    return leads


def discover_serper(leads_by_key):
    """Optional discovery via Serper Places. Returns count of NEW leads added."""
    api_key = os.environ.get("SERPER_API_KEY", "").strip()
    if not api_key or os.environ.get("DISCOVER", "true").lower() == "false":
        return 0
    if not os.path.exists(QUERIES_FILE):
        return 0
    queries = [q.strip() for q in open(QUERIES_FILE, encoding="utf-8") if q.strip()]
    if not queries:
        return 0
    # Rotate 3 queries per day so coverage widens without burning quota.
    start = date.today().toordinal() % len(queries)
    todays = [queries[(start + i) % len(queries)] for i in range(min(3, len(queries)))]
    added = 0
    for q in todays:
        try:
            req = urllib.request.Request(
                "https://google.serper.dev/places",
                data=json.dumps({"q": q, "num": 10}).encode(),
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
        except Exception as e:  # discovery is best-effort; digest still ships
            print(f"  Serper query failed ({q}): {e}")
            continue
        for place in data.get("places", []):
            lead = {
                "business": clean(place.get("title", "")),
                "city": clean(place.get("address", "")),
                "phone": clean(place.get("phoneNumber", "")),
                "email": "",
                "website": clean(place.get("website", "")),
                "rating": str(place.get("rating", "") or ""),
                "reviews": str(place.get("ratingCount", "") or ""),
                "type": clean(place.get("category", "")),
                "status": "discovered — unverified",
                "date_discovered": date.today().isoformat(),
                "notes": "",
                "source": "serper",
            }
            if not lead["business"]:
                continue
            key = dedupe_key(lead)
            if key not in leads_by_key:
                leads_by_key[key] = lead
                added += 1
    return added


def score(lead):
    """Studio scoring model. Returns (total, why-string)."""
    why = []
    name = (lead.get("business", "") + " " + lead.get("type", "")).lower()
    website = clean(lead.get("website", ""))
    dom = domain_of(website)
    notes = clean(lead.get("notes", "")).lower()
    status = clean(lead.get("status", "")).lower()

    # Fit /25 — independent lodging businesses are the studio's sweet spot.
    is_chain = any(c in name for c in CHAINS)
    is_hotel = any(w in name for w in HOTEL_WORDS)
    if is_hotel and not is_chain:
        fit = 25; why.append("independent lodging business")
    elif is_hotel and is_chain:
        fit = 10; why.append("chain property (low fit)")
    elif is_chain:
        fit = 8; why.append("chain brand (low fit)")
    else:
        fit = 15; why.append("business type unclear — verify")

    # Website-problem evidence /25
    if not website:
        problem = 25; why.append("no website found")
    elif any(s in dom for s in ("facebook.com", "booking.com", "expedia.", "hotels.com", "tripadvisor.")):
        problem = 20; why.append("web presence is a social/OTA page, not an owned site")
    elif notes:
        problem = 15
        if any(w in notes for w in PROBLEM_WORDS):
            problem = 25; why.append("audit notes flag website problems")
        else:
            why.append("has website; audit notes on file")
    else:
        problem = 8; why.append("has a website (no audit yet)")

    # Need likelihood /20 — an established, reachable business plausibly needs direct bookings.
    need = 5
    try:
        rating = float(lead.get("rating", "") or 0)
    except ValueError:
        rating = 0
    try:
        reviews = int(float(lead.get("reviews", "") or 0))
    except ValueError:
        reviews = 0
    if rating >= 4.0 and reviews >= 50:
        need = 16; why.append(f"established: {rating}★ from {reviews} reviews")
    elif reviews >= 20:
        need = 12; why.append(f"active business: {reviews} reviews")
    elif rating > 0:
        need = 8
    if lead.get("phone"):
        need = min(20, need + 4)

    # Validated contact /15
    if lead.get("email") and "verified" in status:
        contact = 15; why.append("email on file, marked verified")
    elif lead.get("email"):
        contact = 9; why.append("email on file (unverified)")
    elif lead.get("phone"):
        contact = 5; why.append("phone only")
    else:
        contact = 0; why.append("no contact details yet")

    # Personalisation data /15 — how much specific material exists for a human-written opener.
    pers = 0
    if len(notes) > 40:
        pers += 10
    elif notes:
        pers += 6
    if lead.get("city"):
        pers += 3
    if rating > 0:
        pers += 2
    pers = min(15, pers)

    total = fit + problem + need + contact + pers
    band = "A" if total >= 75 else "B" if total >= 55 else "C" if total >= 35 else "D"
    return total, band, "; ".join(why)


def main():
    previous_keys = load_existing_master_keys()
    leads_by_key = {}
    for lead in read_sources():
        key = dedupe_key(lead)
        existing = leads_by_key.get(key)
        if existing is None:
            leads_by_key[key] = lead
        else:
            # Merge duplicates: fill any gaps in the first row from later rows.
            for k, v in lead.items():
                if v and not existing.get(k):
                    existing[k] = v

    discovered = discover_serper(leads_by_key)

    rows = []
    for key, lead in leads_by_key.items():
        total, band, why = score(lead)
        status = clean(lead.get("status", ""))
        contacted = (
            status.lower() in CONTACTED_STATUSES
            or bool(clean(lead.get("last_sent", "")))
        )
        rows.append({
            "business": lead.get("business", ""),
            "type": lead.get("type", ""),
            "city": lead.get("city", ""),
            "phone": lead.get("phone", ""),
            "email": lead.get("email", ""),
            "website": lead.get("website", ""),
            "rating": lead.get("rating", ""),
            "reviews": lead.get("reviews", ""),
            "score": total,
            "band": band,
            "status": status or "new",
            "contacted": "yes" if contacted else "no",
            "is_new": "yes" if key not in previous_keys else "no",
            "source": lead.get("source", ""),
            "date_discovered": lead.get("date_discovered", ""),
            "why": why,
        })
    rows.sort(key=lambda r: (-r["score"], r["business"].lower()))

    os.makedirs(OUT_DIR, exist_ok=True)
    fields = ["business", "type", "city", "phone", "email", "website", "rating",
              "reviews", "score", "band", "status", "contacted", "is_new",
              "source", "date_discovered", "why"]
    with open(MASTER_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    new_rows = [r for r in rows if r["is_new"] == "yes"]
    fresh = [r for r in rows if r["contacted"] == "no"]
    bands = {b: sum(1 for r in rows if r["band"] == b) for b in "ABCD"}
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    lines = [
        f"# Daily Lead Digest — {today}",
        "",
        "Discovery and scoring only. **No outreach is sent by this pipeline** — "
        "leads here are research for human-reviewed, manually sent messages.",
        "",
        f"- Master list: **{len(rows)}** unique businesses (de-duplicated)",
        f"- New since last digest: **{len(new_rows)}** (incl. {discovered} via Serper today)",
        f"- Not yet contacted: **{len(fresh)}**",
        f"- Score bands: A (75+) **{bands['A']}** · B (55+) **{bands['B']}** · "
        f"C (35+) **{bands['C']}** · D **{bands['D']}**",
        "",
        "## Top uncontacted leads",
        "",
        "| # | Business | City | Score | Why it scores | Contact |",
        "|---|----------|------|-------|---------------|---------|",
    ]
    for i, r in enumerate([r for r in fresh if r["band"] in "AB"][:15], 1):
        contact = r["email"] or r["phone"] or "—"
        city = r["city"][:38]
        lines.append(
            f"| {i} | {r['business']} | {city} | **{r['score']}** | {r['why']} | {contact} |"
        )
    if new_rows:
        lines += ["", "## Newly added", ""]
        for r in new_rows[:15]:
            lines.append(f"- **{r['business']}** ({r['city'] or 'city unknown'}) — score {r['score']}, source: {r['source']}")
    lines += [
        "",
        "_Full scored list: `outputs/leads_master.csv`. "
        "Scores are heuristics from repo data — anything marked unverified must be checked by a human before use._",
        "",
    ]
    digest = "\n".join(lines)
    with open(DIGEST_MD, "w", encoding="utf-8") as f:
        f.write(digest)

    print(f"Master: {len(rows)} leads | new: {len(new_rows)} (Serper: {discovered}) | "
          f"uncontacted: {len(fresh)} | bands A/B/C/D: {bands['A']}/{bands['B']}/{bands['C']}/{bands['D']}")
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(digest)
    return 0


if __name__ == "__main__":
    sys.exit(main())
