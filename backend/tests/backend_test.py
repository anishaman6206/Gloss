"""Gloss backend API tests (Next.js route handlers on port 3000)."""
import requests

BASE_URL = "http://localhost:3000"
SESSION = "test_session_gloss_demo"


# --- /api/define ---
def test_define_valid():
    r = requests.post(f"{BASE_URL}/api/define",
                      json={"phrase": "gloss",
                            "sentence": "She added a quick gloss in the margin."})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    data = body["data"]
    assert isinstance(data["definition"], str) and data["definition"]
    assert "partOfSpeech" in data
    assert isinstance(data["synonyms"], list)
    assert isinstance(data["examples"], list)


def test_define_empty_400():
    r = requests.post(f"{BASE_URL}/api/define", json={})
    assert r.status_code == 400
    body = r.json()
    assert body["ok"] is False
    assert "error" in body


# --- /api/auth/me ---
def test_auth_me_no_cookie_401():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_auth_me_with_cookie():
    r = requests.get(f"{BASE_URL}/api/auth/me",
                     cookies={"session_token": SESSION})
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["user"]["email"] == "demo@gloss.app"
    sub = body["subscription"]
    assert sub["isActive"] is True
    assert sub["isTrialing"] is True
    assert sub["daysLeft"] == 7


# --- /api/auth/logout ---
def test_auth_logout_clears_cookie():
    r = requests.post(f"{BASE_URL}/api/auth/logout",
                      cookies={"session_token": SESSION})
    assert r.status_code == 200
    assert r.json()["ok"] is True
    sc = r.headers.get("set-cookie", "")
    assert "session_token=" in sc
    # expires in the past
    assert "1970" in sc or "Max-Age=0" in sc
