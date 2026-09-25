🏨 USA Hotel Website Outreach Pipeline
An automated lead-generation and outreach system for finding USA hotels, verifying prospects, tracking leads, sending personalized website-development emails, monitoring replies, and controlling the pipeline through Telegram.
🚀 Overview
The pipeline automates repetitive parts of hotel website outreach:
Hotel Discovery
      ↓
Lead Verification
      ↓
Website / Prospect Qualification
      ↓
Lead Storage & Deduplication
      ↓
Personalized Outreach
      ↓
Email Tracking
      ↓
Reply Detection
      ↓
Reply Handling
      ↓
Human Sales Conversation
      ↓
Client / Contract
📊 Current Pipeline Snapshot
The repository currently contains an operational USA hotel outreach pipeline with approximately:
- 858 discovered leads
- 481 emails sent
- USA-focused hotel prospecting
- Serper-based search/discovery
- Email outreach
- Reply checking and handling
- Telegram notifications/control
- Hotel demo websites
- Local, Termux, and automated workflow support
These figures are operational snapshots and may change as the pipeline runs.

📁 Repository Structure
hotelpipeline/
│
├── .agents/
│   └── skills/
│       └── hotel-website-outreach/
│
├── .github/
│   └── workflows/
│
├── contracts/
├── goa_leads_site/
├── hotel-demo-executive-hotel-pacific-downtown-seattle/
├── hotel-demo-harborside-inn-boston/
│
├── batch_discover.py
├── check_replies.py
├── daily_auto_pipeline.py
├── hotel_agent.py
├── reply_handler.py
├── telegram_chatbot.py
├── telegram_notifier.py
├── usa_business_finder.py
├── usa_hotel_agent.py
├── us_serper_live.py
├── outreach_sender.py
├── turbo_loop_batch.py
│
├── auto_send_3pm.py
├── auto_send_3pm.ps1
├── auto_send_3pm.bat
├── run_daily_3pm.sh
├── termux_run.sh
│
├── usa_hotel_leads.csv
├── google_sheets_leads.csv
├── sent_log_usa_hotels.json
├── verified.json
├── daily_auto.log
│
├── demo_hotel.html
├── install.ps1
├── AGENTS.md
├── kilo.json
└── README.md
🔍 Main Components
usa_business_finder.py
Discovers potential USA business and hotel prospects using search services.
Typical responsibilities:
- Search-engine discovery
- Finding hotel businesses
- Finding contact information
- Collecting website information
- Preparing candidate leads
usa_hotel_agent.py
Handles hotel-specific prospecting and qualification.
Potential responsibilities include:
- Hotel identification
- Prospect filtering
- Website checks
- Lead enrichment
- Preparing qualified hotel leads
batch_discover.py
Runs discovery in batches rather than processing the entire search space at once.
This helps with:
- API limits
- Search cost control
- Incremental lead generation
- Resuming discovery
us_serper_live.py
Provides Serper-based search functionality for USA prospect discovery.
Important operational concerns:
- API-key security
- Search limits
- Error handling
- Duplicate results
- Query efficiency
daily_auto_pipeline.py
Acts as the main automation/orchestration layer.
A typical execution is:
Discover
  ↓
Verify
  ↓
Filter
  ↓
Store
  ↓
Send
  ↓
Log
  ↓
Notify
This file should be treated as one of the most important files in the project because mistakes here can cause duplicate processing or unintended outreach.
outreach_sender.py
Responsible for sending outreach emails.
Important safeguards should include:
- Duplicate-send protection
- Daily sending limits
- Retry handling
- Failed-send logging
- Valid email checks
- Reply-state checks
- Personalization
- Secure credential handling
check_replies.py
Checks inboxes for responses to outreach.
The reply system should distinguish between:
Positive / Interested
        ↓
Human follow-up

Question
        ↓
Human review

Not interested
        ↓
Stop follow-ups

Unsubscribe / Do not contact
        ↓
Permanent suppression

Bounce
        ↓
Invalid / suppressed
reply_handler.py
Processes detected replies and determines the next internal action.
The goal is to surface interested hotel owners quickly instead of leaving important replies buried inside an automated process.
telegram_chatbot.py
Provides remote pipeline control and monitoring.
Possible functions include:
- Pipeline status
- Lead counts
- Send status
- Reply notifications
- Start/stop controls
- Error notifications
Mass-sending commands should always have safeguards.
telegram_notifier.py
Sends pipeline events and alerts to Telegram.
Useful notifications include:
- New qualified lead
- Email successfully sent
- Email failed
- Positive reply detected
- Pipeline error
- Daily summary
💾 Data Files
usa_hotel_leads.csv
Primary lead dataset.
A useful lead record can contain:
hotel_name
city
state
country
website
email
phone
source
qualification_status
email_status
reply_status
last_contacted
next_follow_up
notes
google_sheets_leads.csv
Used for Google Sheets-related lead data or synchronization.
The project should maintain one clear source of truth to avoid conflicting lead states.
sent_log_usa_hotels.json
Tracks outreach activity.
At minimum, the system should determine:
Has this email already been contacted?
When was it contacted?
Which campaign/message was used?
Was it successful?
Did the recipient reply?
Should another message be sent?
verified.json
Stores verification-related information.
Verification should happen before expensive or irreversible actions such as outreach.
🤖 Automation
The repository contains several execution methods:
GitHub Actions
     │
     ├── Automated workflow
     │
Local PC
     │
     ├── Python
     ├── PowerShell
     └── Batch
     
Linux / VPS / Termux
     │
     ├── Shell scripts
     └── Python
Avoid running multiple schedulers simultaneously unless duplicate execution is explicitly prevented.
🔐 Security
Never commit secrets
API keys, SMTP credentials, Telegram bot tokens, passwords, OAuth tokens, and other secrets should not be stored directly in source files.
Use environment variables or GitHub Actions Secrets.
Example:
SERPER_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
EMAIL_PASSWORD=your_password
Before publishing the repository, check the complete Git history for accidentally committed credentials.
🛡️ Outreach Safeguards
Automated outreach should include strong controls.
Duplicate protection
Never send if:
email already contacted
OR
hotel already contacted
OR
domain already contacted
unless the campaign explicitly permits another contact.
Global kill switch
The pipeline should have a way to immediately stop all sending.
Example:
SEND_ENABLED=false
Daily limit
Use a configurable maximum:
DAILY_SEND_LIMIT=...
Reply suppression
If someone replies, automated follow-ups should stop until the reply has been reviewed.
Unsubscribe suppression
Contacts requesting no further communication should be permanently suppressed.
📈 Sales Funnel
The system should measure more than emails sent.
Recommended funnel:
Discovered
    ↓
Qualified
    ↓
Contact Found
    ↓
Email Sent
    ↓
Delivered
    ↓
Reply
    ↓
Interested
    ↓
Demo Sent
    ↓
Meeting
    ↓
Proposal
    ↓
Client
Useful metrics:
- Discovery → qualification rate
- Qualification → email rate
- Email → reply rate
- Reply → positive reply rate
- Positive reply → demo rate
- Demo → meeting rate
- Meeting → client rate
- Client acquisition cost
- API/search cost per qualified lead
🧪 Audit Checklist
Before scaling the pipeline, verify:
- No API keys committed to Git
- No duplicate hotel records
- No duplicate email sends
- Website qualification works correctly
- Invalid emails are rejected
- Bounce handling works
- Reply detection works
- Positive replies reach the owner quickly
- Unsubscribe requests stop future outreach
- Daily sending limits work
- Kill switch works
- Failed jobs can resume safely
- Multiple schedulers cannot accidentally run the same batch
- GitHub Actions secrets are configured securely
- Telegram controls cannot accidentally trigger uncontrolled mass sending
- Lead state remains consistent across CSV/JSON/Sheets
- Logs contain enough information to debug failures
🏗️ Recommended Architecture
                ┌─────────────────┐
                │ Search / Serper │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Lead Discovery  │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Verification    │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Qualification   │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Lead Database   │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Outreach Queue  │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Email Sender    │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Reply Monitor   │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Human Sales     │
                └─────────────────┘
Automation should handle repetitive operations; human review should handle sales conversations and important decisions.

📌 Development Roadmap
Phase 1 — Reliability
- Centralize lead state
- Strengthen duplicate detection
- Add robust error handling
- Add global sending limits
- Add kill switch
- Improve logging
Phase 2 — Outreach
- Improve personalization
- Add controlled follow-ups
- Add bounce detection
- Add unsubscribe suppression
- Track campaign performance
Phase 3 — Reply Intelligence
- Classify replies
- Detect interested prospects
- Notify immediately
- Keep humans in control of client conversations
Phase 4 — Analytics
Build a dashboard showing:
Total Leads
Qualified Leads
Emails Sent
Replies
Positive Replies
Demos Sent
Meetings
Proposals
Clients
Revenue
⚠️ Current Priority
The pipeline should not be scaled simply because more leads are available.
The critical funnel is:
858 leads
   ↓
481 emails
   ↓
How many replies?
   ↓
How many interested?
   ↓
How many demos?
   ↓
How many conversations?
   ↓
How many paying clients?
If these numbers are not tracked reliably, improving discovery alone will not solve the sales problem.
📄 License
This project is currently maintained as a personal automation project. Add an explicit open-source license before accepting external contributions or redistributing the code.
Project: USA Hotel Website Outreach Pipeline
Repository: Ahmadraza970/hotelpipeline
