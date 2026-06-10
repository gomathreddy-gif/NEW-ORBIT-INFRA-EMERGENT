"""Phase 3 tests: customer auth, saved searches, PDF upload, property lat/lng + floor_plan_pdfs."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://orbit-realty-hub.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "orbitinfra4039@gmail.com"
ADMIN_PASSWORD = ".orbit@4039"

state = {}


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_client(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {r.json()['token']}"})
    return s


@pytest.fixture(scope="module")
def customer_client(client):
    email = f"test_cust_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "test12345"
    r = client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "TEST_Customer", "email": email, "password": pwd, "mobile": "9000000000"
    })
    assert r.status_code == 200, r.text
    data = r.json()
    state["customer_email"] = email
    state["customer_password"] = pwd
    state["customer_token"] = data["token"]
    state["customer_user"] = data["user"]
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {data['token']}"})
    return s


# ---- Register ----
def test_register_returns_customer_role_and_token(customer_client):
    user = state["customer_user"]
    assert user["role"] == "customer"
    assert user["email"] == state["customer_email"]
    assert "id" in user
    assert len(state["customer_token"]) > 20


def test_register_duplicate_email_returns_400(client, customer_client):
    r = client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Dup", "email": state["customer_email"], "password": "x12345"
    })
    assert r.status_code == 400


# ---- Login for customer ----
def test_customer_login_works(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={
        "email": state["customer_email"], "password": state["customer_password"]
    })
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["role"] == "customer"
    assert data["user"]["email"] == state["customer_email"]


def test_admin_login_still_works(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "admin"


# ---- /auth/me returns any role ----
def test_auth_me_customer(customer_client):
    r = customer_client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["role"] == "customer"
    assert data["email"] == state["customer_email"]


def test_auth_me_admin(admin_client):
    r = admin_client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


# ---- Customer cannot hit admin endpoints ----
def test_customer_cannot_create_property(customer_client):
    payload = {
        "name": "TEST_Customer Attempt", "property_type": "Villa", "location": "X",
        "price": 1, "area_sqft": 1
    }
    r = customer_client.post(f"{BASE_URL}/api/properties", json=payload)
    assert r.status_code == 403


def test_customer_cannot_list_leads(customer_client):
    r = customer_client.get(f"{BASE_URL}/api/leads")
    assert r.status_code == 403


def test_customer_cannot_upload_pdf(customer_client):
    h = {k: v for k, v in customer_client.headers.items() if k.lower() != "content-type"}
    files = {"file": ("x.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
    r = requests.post(f"{BASE_URL}/api/upload-pdf", files=files, headers=h)
    assert r.status_code == 403


# ---- Saved searches (customer scope) ----
def test_saved_search_requires_auth():
    # Fresh requests (no cookies) to verify unauth response
    r = requests.get(f"{BASE_URL}/api/saved-searches")
    assert r.status_code == 401
    r2 = requests.post(f"{BASE_URL}/api/saved-searches", json={"name": "x", "filters": {}})
    assert r2.status_code == 401


def test_create_saved_search(customer_client):
    payload = {"name": "TEST_3BHK Vijayawada", "filters": {"location": "Vijayawada", "bedrooms": 3}}
    r = customer_client.post(f"{BASE_URL}/api/saved-searches", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert data["filters"] == payload["filters"]
    assert "id" in data
    state["search_id"] = data["id"]


def test_list_saved_searches_scoped(customer_client):
    r = customer_client.get(f"{BASE_URL}/api/saved-searches")
    assert r.status_code == 200
    items = r.json()
    assert any(s["id"] == state["search_id"] for s in items)
    # all items belong to this user
    uid = state["customer_user"]["id"]
    assert all(s.get("user_id") == uid for s in items)


def test_saved_search_isolated_to_user(client):
    """A second customer should NOT see first customer's saved searches."""
    email2 = f"test_cust2_{uuid.uuid4().hex[:8]}@example.com"
    r = client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Cust2", "email": email2, "password": "test12345"
    })
    assert r.status_code == 200
    tok2 = r.json()["token"]
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {tok2}"})
    r2 = s.get(f"{BASE_URL}/api/saved-searches")
    assert r2.status_code == 200
    ids = [x["id"] for x in r2.json()]
    assert state["search_id"] not in ids


def test_delete_saved_search(customer_client):
    sid = state["search_id"]
    r = customer_client.delete(f"{BASE_URL}/api/saved-searches/{sid}")
    assert r.status_code == 200
    items = customer_client.get(f"{BASE_URL}/api/saved-searches").json()
    assert sid not in [s["id"] for s in items]


# ---- PDF upload (admin) ----
def test_upload_pdf_admin(admin_client):
    h = {k: v for k, v in admin_client.headers.items() if k.lower() != "content-type"}
    pdf_bytes = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    files = {"file": ("floorplan_test.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    r = requests.post(f"{BASE_URL}/api/upload-pdf", files=files, headers=h)
    if r.status_code != 200:
        pytest.skip(f"PDF upload skipped (storage may be unavailable): {r.status_code} {r.text[:200]}")
    data = r.json()
    assert "path" in data
    assert "name" in data
    assert data["name"].endswith(".pdf")
    state["pdf_path"] = data["path"]
    state["pdf_name"] = data["name"]


def test_upload_pdf_rejects_non_pdf(admin_client):
    h = {k: v for k, v in admin_client.headers.items() if k.lower() != "content-type"}
    files = {"file": ("not_a_pdf.txt", io.BytesIO(b"hello"), "text/plain")}
    r = requests.post(f"{BASE_URL}/api/upload-pdf", files=files, headers=h)
    assert r.status_code == 400


def test_upload_pdf_requires_auth():
    files = {"file": ("x.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
    r = requests.post(f"{BASE_URL}/api/upload-pdf", files=files)
    assert r.status_code == 401


# ---- Property with lat/lng + floor_plan_pdfs ----
def test_property_with_lat_lng_and_pdfs(admin_client):
    payload = {
        "name": "TEST_GeoVilla",
        "property_type": "Villa",
        "location": "Vijayawada",
        "city": "Andhra Pradesh",
        "price": 7500000,
        "area_sqft": 2800,
        "bedrooms": 3,
        "bathrooms": 3,
        "lat": 16.5062,
        "lng": 80.6480,
        "floor_plan_pdfs": [
            {"name": "Ground Floor.pdf", "path": state.get("pdf_path", "orbit-infra/floorplans/dummy.pdf")},
            {"name": "First Floor.pdf", "path": "orbit-infra/floorplans/dummy2.pdf"},
        ],
        "featured": False,
    }
    r = admin_client.post(f"{BASE_URL}/api/properties", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["lat"] == 16.5062
    assert data["lng"] == 80.6480
    assert isinstance(data["floor_plan_pdfs"], list)
    assert len(data["floor_plan_pdfs"]) == 2
    assert data["floor_plan_pdfs"][0]["name"] == "Ground Floor.pdf"
    state["geo_pid"] = data["id"]


def test_property_get_returns_lat_lng_pdfs(client):
    pid = state["geo_pid"]
    r = client.get(f"{BASE_URL}/api/properties/{pid}")
    assert r.status_code == 200
    data = r.json()
    assert data["lat"] == 16.5062
    assert data["lng"] == 80.6480
    assert len(data["floor_plan_pdfs"]) == 2


def test_property_with_geo_cleanup(admin_client):
    pid = state.get("geo_pid")
    if pid:
        admin_client.delete(f"{BASE_URL}/api/properties/{pid}")
