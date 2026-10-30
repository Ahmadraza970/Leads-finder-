# Leads Finder — Ahmad Digital Studio

Lead research system for [Ahmad Digital Studio](https://ahmadstudio.onrender.com):
it finds independent hotels, motels, inns and B&Bs in the US, UK, Canada and India,
checks what state their web presence is in, and scores each lead so outreach time
goes to the businesses most likely to need a direct-booking website.

[![Daily Lead Digest](https://github.com/Ahmadraza970/Leads-finder-/actions/workflows/daily-lead-digest.yml/badge.svg)](https://github.com/Ahmadraza970/Leads-finder-/actions/workflows/daily-lead-digest.yml)

## ⚠️ Safety rule — read first

**Nothing in this repo sends email automatically.** Discovery, scoring and drafting
only. Every outreach message is personalised, approved by a human, and sent manually
through the studio's connected Gmail — within a 30/day cap, verified contacts only,
and stopped immediately if a business declines. If a script here ever appears to
"auto-send", that is a bug: open an issue, do not run it.

## What runs every day

The **Daily Lead Digest** workflow (`.github/workflows/daily-lead-digest.yml`) runs at
08:45 IST and on demand from the Actions tab:

1. Reads the lead CSVs in this repo and merges them into one master list.
2. De-duplicates by website domain → email → name + city.
3. Optionally discovers a few new hotels via the Serper API (rotating queries from
   `pipeline/queries.txt`) when the `SERPER_API_KEY` secret is configured.
4. Scores every lead 0–100 (model below) and commits:
   - `outputs/leads_master.csv` — the full scored, de-duplicated list
   - `outputs/daily_digest.md` — the day's digest: totals, score bands, top
     un-contacted leads, and what's new

The run's digest also appears in the GitHub Actions job summary.

### Scoring model (0–100)

| Component | Points | Based on |
|---|---|---|
| Fit | 25 | Independent lodging business (chains score low) |
| Website-problem evidence | 25 | No website, social/OTA page instead of an owned site, or audit notes flagging problems |
| Need likelihood | 20 | Established business (rating / review volume) and reachable |
| Validated contact | 15 | Verified email > unverified email > phone only |
| Personalisation data | 15 | Audit notes, city, rating — material for a specific human-written opener |

Scores are heuristics from the data in this repo. Anything marked *unverified* must be
checked by a human before it is used.

## Repository layout

| Path | What it is |
|---|---|
| `pipeline/daily_lead_digest.py` | The daily digest (stdlib-only Python, no dependencies) |
| `pipeline/queries.txt` | Serper discovery queries, rotated daily |
| `outputs/` | Committed results of the daily digest |
| `usa_hotel_leads.csv`, `google_sheets_leads.csv` | Lead source data |
| `hotel_agent.py`, `batch_discover.py`, `usa_hotel_agent.py`, … | Local research/discovery scripts (run manually) |
| `.agents/skills/hotel-website-outreach/` | The outreach skill: prospecting, lead management, ROI and drafting helpers |
| `hotel-demo-*/`, `goa_leads_site/`, `demo_hotel.html` | Demo sites built for prospects |
| `bug-finder/`, `contracts/` | Side projects kept in this repo |

## Setup

**Daily digest (GitHub Actions):** no local setup. Optional: add a `SERPER_API_KEY`
repository secret (Settings → Secrets and variables → Actions) to enable discovery.
Without it, the digest still builds from the CSVs already in the repo.

**Local scripts:** Python 3.11+. Credentials are read from environment variables —
never from files committed here:

```bash
export SERPER_API_KEY="…"     # Serper discovery
export SMTP_USER="…"          # local outreach tooling only
export SMTP_PASS="…"          # use a Gmail App Password, never your main password
```

Config templates live in `.agents/skills/hotel-website-outreach/data/` as
`config.example.json` and `serper_config.example.json`. Copy to `config.json` /
`serper_config.json` locally if a script needs the file form — both names are
git-ignored.

## Security notice

This is a **public** repository. Real credentials were committed here in the past
(an SMTP password in `data/config.json` and a Serper API key). The files have been
removed and replaced with templates, and the workflow now uses GitHub Secrets —
**but the old values remain in git history and must be treated as compromised:
rotate the Gmail App Password and the Serper key.** Do not try to "fix" history by
force-pushing without a plan; rotation is the real fix.
