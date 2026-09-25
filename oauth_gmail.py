#!/usr/bin/env python3
"""
oauth_gmail.py - Run OAuth flow to get Gmail read scope.
Uses installed client_secret.json with port 8080 (matches redirect_uris).
"""
import os, json, sys, time, urllib.parse, urllib.request, http.server, threading
from datetime import datetime

HERMES_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRET = os.path.join(HERMES_DIR, "client_secret_installed.json")
TOKEN_FILE = os.path.join(HERMES_DIR, "google_token.json")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def run_oauth():
    with open(CLIENT_SECRET) as f:
        config = json.load(f)["installed"]

    redirect_uri = "http://localhost:8080/"

    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urllib.parse.urlencode({
            "client_id": config["client_id"],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(SCOPES),
            "access_type": "offline",
            "prompt": "consent",
        })
    )

    print(f"Open this URL in your browser:\n{auth_url}\n")
    print("Waiting for callback on port 8080...")

    auth_code = [None]

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            code = params.get("code", [None])[0]
            if code:
                auth_code[0] = code
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                self.wfile.write(b"<html><body><h1>Authorization successful!</h1><p>You can close this window.</p></body></html>")
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing code")

        def log_message(self, format, *args):
            pass

    server = http.server.HTTPServer(("", 8080), Handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()

    for _ in range(180):
        if auth_code[0]:
            break
        time.sleep(1)

    server.shutdown()

    if not auth_code[0]:
        print("ERROR: No authorization code received.")
        sys.exit(1)

    code = auth_code[0]
    print("Got code. Exchanging for token...")

    token_data = urllib.parse.urlencode({
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }).encode()

    token_req = urllib.request.Request(
        config["token_uri"],
        data=token_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token_resp = urllib.request.urlopen(token_req)
    tokens = json.loads(token_resp.read())

    token_info = {
        "token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token"),
        "token_uri": config["token_uri"],
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "scopes": SCOPES,
        "expiry": datetime.now().timestamp() + tokens.get("expires_in", 3600),
    }

    with open(TOKEN_FILE, "w") as f:
        json.dump(token_info, f, indent=2)

    print(f"Token saved! Scopes: {SCOPES}")

if __name__ == "__main__":
    run_oauth()