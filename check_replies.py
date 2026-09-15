#!/usr/bin/env python3
"""Check Gmail for replies and classify them."""
import os, json, csv, base64, re
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

desktop = "C:/Users/AHMAD RAJA/Desktop/hermes"
TOKEN = os.path.join(desktop, "google_token.json")
CSV = os.path.join(desktop, "usa_hotel_leads.csv")
SENT_LOG = os.path.join(desktop, "sent_log_usa_hotels.json")

creds = Credentials.from_authorized_user_file(TOKEN, [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
])
service = build('gmail', 'v1', credentials=creds)

sent_data = json.loads(open(SENT_LOG, encoding='utf-8').read()) if os.path.exists(SENT_LOG) else {'sent': []}
sent_emails = {s['email'].lower() for s in sent_data.get('sent', [])}

query = ' OR '.join([f'from:{e}' for e in list(sent_emails)[:10]])
results = service.users().messages().list(userId='me', q=query, maxResults=20).execute()
messages = results.get('messages', [])
print(f'Replies from sent emails: {len(messages)}')

if messages:
    rows = list(csv.DictReader(open(CSV, encoding='utf-8')))
    
    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = msg_data.get('payload', {}).get('headers', [])
        sender = ''
        subject = ''
        for h in headers:
            if h['name'] == 'From': sender = h['value']
            if h['name'] == 'Subject': subject = h['value']
        
        body = ''
        payload = msg_data.get('payload', {})
        if 'data' in payload:
            body = base64.urlsafe_b64decode(payload['data']).decode('utf-8', errors='ignore')
        elif 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain' and 'data' in part:
                    body = base64.urlsafe_b64decode(part['data']).decode('utf-8', errors='ignore')
                    break
        
        sender_email = ''
        email_match = re.search(r'<([^>]+@[^>]+)>', sender)
        if email_match:
            sender_email = email_match.group(1).lower()
        else:
            email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', sender)
            if email_match:
                sender_email = email_match.group(1).lower()
        
        print(f'From: {sender}')
        print(f'Subject: {subject}')
        print(f'Body: {body[:300]}')
        print('---')
        
        matched_lead = None
        for r in rows:
            if r.get('email', '').lower() == sender_email:
                matched_lead = r
                break
        
        if matched_lead:
            print(f'  Matched: {matched_lead["hotel_name"]} ({matched_lead["city"]})')
            
            text_lower = (subject + ' ' + body).lower()
            
            if any(w in text_lower for w in ['unsubscribe', 'remove', 'stop', 'opt out', 'don\'t contact', 'delivery status', 'failure', 'mailer-daemon']):
                classification = 'bounce'
            elif any(w in text_lower for w in ['not interested', 'no thanks', 'don\'t need', 'already have', 'happy with', 'satisfied']):
                classification = 'not_interested'
            elif any(w in text_lower for w in ['interested', 'demo', 'show me', 'can you', 'send me', 'sample', 'example', 'see it', 'look at', 'would like', 'looking for']):
                classification = 'interested_demo'
            elif any(w in text_lower for w in ['how much', 'price', 'cost', 'pricing', 'budget', 'quote', 'estimate']):
                classification = 'price_request'
            elif any(w in text_lower for w in ['thank you', 'thanks', 'automatic reply', 'auto reply', 'out of office']):
                classification = 'auto_reply'
            else:
                classification = 'unclear'
            
            matched_lead['status'] = classification
            matched_lead['reply_body'] = body[:1000]
            matched_lead['reply_date'] = '2026-09-10'
            
            if classification == 'interested_demo':
                demo_name = matched_lead['hotel_name'].replace(' ', '-').replace('\'', '').replace('.', '')
                matched_lead['demo_link'] = f'https://hotel-demo-{demo_name.lower()}.vercel.app'
                matched_lead['response_draft'] = f'Hi! Great to hear from you. I have a live demo website ready for {matched_lead["hotel_name"]} in {matched_lead["city"]}. Check it out: {matched_lead["demo_link"]}'
                print(f'  -> Demo link: {matched_lead["demo_link"]}')
            elif classification == 'price_request':
                matched_lead['response_draft'] = f'Thanks for your interest! Our direct booking website packages start at competitive rates with zero commission. Would you like me to send a customized demo for {matched_lead["city"]}?'
            elif classification == 'not_interested':
                matched_lead['response_draft'] = 'Understood. Will follow up in 30 days if needed.'
            elif classification == 'bounce':
                matched_lead['response_draft'] = 'Email bounced. Remove from list.'
                matched_lead['email'] = ''
            elif classification == 'auto_reply':
                matched_lead['response_draft'] = 'Auto-reply received. Will follow up in 7 days.'
            
            print(f'  Classification: {classification}')
            print(f'  Response draft: {matched_lead.get("response_draft", "")[:100]}')
        
        service.users().messages().modify(
            userId='me', id=msg['id'],
            body={'removeLabelIds': ['UNREAD']}
        ).execute()

if 'rows' in locals() and rows:
    fields = list(rows[0].keys()) if rows else ['id','hotel_name','city','phone','email','website','status','date_discovered','audit_notes']
    all_fields = set(fields)
    for r in rows:
        all_fields.update(r.keys())
    fields = sorted(all_fields)
    with open(CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)

print(f'\nCSV updated.')
print(f'Total sent: {len(sent_data["sent"])}')