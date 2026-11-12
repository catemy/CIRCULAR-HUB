"""Smoke-test user registration, login, and the authenticated profile endpoint.

Run against a local API by default:
    python auth_test.py

Set CIRCULARHUB_API_URL to target another environment intentionally.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from uuid import uuid4


BASE_URL = os.environ.get("CIRCULARHUB_API_URL", "http://127.0.0.1:8000").rstrip("/")
RUN_ID = uuid4().hex[:12]
USERNAME = f"smoke-{RUN_ID}"
EMAIL = f"{USERNAME}@example.com"
PASSWORD = f"Smoke-{uuid4().hex}-A1!"


def request_json(path, method="GET", body=None, token=None):
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers=headers,
        method=method,
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        response_body = response.read()
        return response.status, json.loads(response_body) if response_body else {}


def main():
    try:
        status, user = request_json(
            "/auth/register",
            method="POST",
            body={
                "username": USERNAME,
                "email": EMAIL,
                "password": PASSWORD,
                "country": "Global",
            },
        )
        assert status == 200 and user.get("username") == USERNAME
        print("PASS registration")

        status, token_data = request_json(
            "/auth/login",
            method="POST",
            body={"username": USERNAME, "password": PASSWORD},
        )
        token = token_data.get("access_token")
        assert status == 200 and token and token_data.get("token_type") == "bearer"
        print("PASS login")

        status, profile = request_json("/auth/me", token=token)
        assert status == 200 and profile.get("username") == USERNAME
        print("PASS authenticated profile")
    except (urllib.error.URLError, urllib.error.HTTPError, AssertionError, ValueError) as error:
        if isinstance(error, urllib.error.HTTPError):
            message = f"HTTP {error.code}"
        elif isinstance(error, urllib.error.URLError):
            message = f"API request failed: {error.reason}"
        elif isinstance(error, AssertionError):
            message = "API returned an unexpected response"
        else:
            message = "API returned invalid JSON"
        print(f"FAIL {message}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
