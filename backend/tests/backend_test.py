"""Backend API tests for Orbit Infra Projects."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://orbit-realty-hub.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "orbitinfra4039@gmail.com"
ADMIN_PASSWORD = ".orbit@4039"

# Shared state across tests (ordered file)
state = {}


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_client(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    token = r.json()["token"]
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


# ---- Health ----
def test_health(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# ---- Auth ----
def test_login_success(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    state["token"] = data["token"]


def test_login_invalid(client):
    r = client.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_auth_me(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_auth_me_unauthorized():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# ---- Testimonials ----
def test_testimonials_seeded(client):
    r = client.get(f"{BASE_URL}/api/testimonials")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list) and len(items) >= 3


# ---- Properties CRUD ----
def test_properties_public_list(client):
    r = client.get(f"{BASE_URL}/api/properties")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_property_create_requires_auth():
    r = requests.post(f"{BASE_URL}/api/properties", json={"name": "X", "property_type": "Villa", "location": "Y", "price": 1, "area_sqft": 1})
    assert r.status_code == 401


def test_property_create(auth_client):
    payload = {
        "name": "TEST_Orbit Villa",
        "property_type": "Villa",
        "location": "Vijayawada",
        "city": "Andhra Pradesh",
        "price": 5000000,
        "area_sqft": 2400,
        "bedrooms": 3,
        "bathrooms": 3,
        "status": "Available",
        "project_status": "Ongoing",
        "description": "Test villa",
        "amenities": ["Pool", "Gym"],
        "featured": True,
    }
    r = auth_client.post(f"{BASE_URL}/api/properties", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert "id" in data
    state["pid"] = data["id"]


def test_property_get_by_id(client):
    pid = state["pid"]
    r = client.get(f"{BASE_URL}/api/properties/{pid}")
    assert r.status_code == 200
    assert r.json()["id"] == pid
    assert r.json()["name"] == "TEST_Orbit Villa"


def test_property_visible_in_public_list(client):
    r = client.get(f"{BASE_URL}/api/properties")
    ids = [p["id"] for p in r.json()]
    assert state["pid"] in ids


def test_property_filter_location(client):
    r = client.get(f"{BASE_URL}/api/properties", params={"location": "Vijayawada", "property_type": "Villa"})
    assert r.status_code == 200
    assert any(p["id"] == state["pid"] for p in r.json())


def test_property_update(auth_client):
    pid = state["pid"]
    payload = {
        "name": "TEST_Orbit Villa Updated",
        "property_type": "Villa",
        "location": "Vijayawada",
        "price": 5500000,
        "area_sqft": 2400,
        "bedrooms": 4,
        "bathrooms": 3,
    }
    r = auth_client.put(f"{BASE_URL}/api/properties/{pid}", json=payload)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Orbit Villa Updated"
    # verify persistence
    g = requests.get(f"{BASE_URL}/api/properties/{pid}")
    assert g.json()["bedrooms"] == 4


# ---- Leads (public POST, admin list) ----
def test_lead_public_create(client):
    r = client.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST_John",
        "mobile": "9999999999",
        "email": "test@example.com",
        "message": "I am interested",
        "lead_type": "enquiry",
        "property_id": state.get("pid"),
        "property_name": "TEST_Orbit Villa Updated",
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["ok"] is True and "id" in data
    state["lead_id"] = data["id"]


def test_leads_list_requires_auth():
    r = requests.get(f"{BASE_URL}/api/leads")
    assert r.status_code == 401


def test_leads_list_admin(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/leads")
    assert r.status_code == 200
    items = r.json()
    assert any(l["id"] == state["lead_id"] for l in items)


def test_lead_status_update(auth_client):
    lid = state["lead_id"]
    r = auth_client.patch(f"{BASE_URL}/api/leads/{lid}", json={"status": "Contacted"})
    assert r.status_code == 200
    # verify
    items = auth_client.get(f"{BASE_URL}/api/leads").json()
    lead = next(l for l in items if l["id"] == lid)
    assert lead["status"] == "Contacted"


# ---- Notifications ----
def test_notifications_present_after_lead(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/notifications")
    assert r.status_code == 200
    items = r.json()
    assert any((n.get("lead_id") == state["lead_id"]) for n in items)


# ---- Admin Stats ----
def test_admin_stats(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/admin/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ["total_properties", "total_leads", "new_leads", "unread_notifications"]:
        assert k in data and isinstance(data[k], int)
    assert data["total_properties"] >= 1
    assert data["total_leads"] >= 1


# ---- Upload (best-effort) ----
def test_upload_image(auth_client):
    # tiny 1x1 PNG
    png = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C636000010000000500010D0A2DB40000000049454E44AE426082"
    )
    files = {"file": ("test.png", io.BytesIO(png), "image/png")}
    # Remove content-type for multipart
    h = {k: v for k, v in auth_client.headers.items() if k.lower() != "content-type"}
    r = requests.post(f"{BASE_URL}/api/upload", files=files, headers=h)
    if r.status_code != 200:
        pytest.skip(f"Upload skipped (storage may be unavailable): {r.status_code} {r.text[:200]}")
    data = r.json()
    assert "path" in data and "url" in data
    state["upload_path"] = data["path"]


def test_file_serve(client):
    path = state.get("upload_path")
    if not path:
        pytest.skip("No uploaded file to serve")
    r = client.get(f"{BASE_URL}/api/files/{path}")
    assert r.status_code == 200
    assert len(r.content) > 0


# ---- Cleanup ----
def test_property_delete(auth_client):
    pid = state["pid"]
    r = auth_client.delete(f"{BASE_URL}/api/properties/{pid}")
    assert r.status_code == 200
    # verify gone
    g = requests.get(f"{BASE_URL}/api/properties/{pid}")
    assert g.status_code == 404


def test_lead_delete(auth_client):
    lid = state["lead_id"]
    r = auth_client.delete(f"{BASE_URL}/api/leads/{lid}")
    assert r.status_code == 200


# =========================================================
# Phase 2: Blogs, Agents, Newsletter, Properties-by-ids
# =========================================================

# ---- Blogs ----
def test_blogs_public_list_published_only(client):
    r = client.get(f"{BASE_URL}/api/blogs")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_blog_create_requires_auth():
    r = requests.post(f"{BASE_URL}/api/blogs", json={"title": "x", "content": "y"})
    assert r.status_code == 401


def test_blog_create(auth_client):
    payload = {
        "title": "TEST_Real Estate Investing 101",
        "excerpt": "Test excerpt",
        "content": "## Heading\nSome **markdown** content for testing.",
        "tags": ["test", "investing"],
        "author": "TEST_Author",
        "published": True,
    }
    r = auth_client.post(f"{BASE_URL}/api/blogs", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["title"] == payload["title"]
    assert data["slug"]  # auto-generated
    assert "id" in data
    state["blog_id"] = data["id"]
    state["blog_slug"] = data["slug"]


def test_blog_get_by_slug(client):
    slug = state["blog_slug"]
    r = client.get(f"{BASE_URL}/api/blogs/{slug}")
    assert r.status_code == 200
    assert r.json()["slug"] == slug


def test_blog_get_by_id(client):
    bid = state["blog_id"]
    r = client.get(f"{BASE_URL}/api/blogs/{bid}")
    assert r.status_code == 200
    assert r.json()["id"] == bid


def test_blog_listed_published(client):
    r = client.get(f"{BASE_URL}/api/blogs")
    ids = [b["id"] for b in r.json()]
    assert state["blog_id"] in ids


def test_blog_update_and_unpublish(auth_client):
    bid = state["blog_id"]
    payload = {
        "title": "TEST_Real Estate Investing 101 (Updated)",
        "content": "Updated content",
        "published": False,
        "tags": ["test"],
        "author": "TEST_Author",
    }
    r = auth_client.put(f"{BASE_URL}/api/blogs/{bid}", json=payload)
    assert r.status_code == 200
    assert r.json()["title"].endswith("(Updated)")
    # not in published-only list
    pub = requests.get(f"{BASE_URL}/api/blogs").json()
    assert state["blog_id"] not in [b["id"] for b in pub]
    # in unpublished list (admin can fetch all)
    allb = auth_client.get(f"{BASE_URL}/api/blogs", params={"published_only": False}).json()
    assert state["blog_id"] in [b["id"] for b in allb]


def test_blog_delete(auth_client):
    bid = state["blog_id"]
    r = auth_client.delete(f"{BASE_URL}/api/blogs/{bid}")
    assert r.status_code == 200
    g = requests.get(f"{BASE_URL}/api/blogs/{bid}")
    assert g.status_code == 404


# ---- Agents ----
def test_agents_public_list(client):
    r = client.get(f"{BASE_URL}/api/agents")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_agent_create_requires_auth():
    r = requests.post(f"{BASE_URL}/api/agents", json={"name": "x"})
    assert r.status_code == 401


def test_agent_create(auth_client):
    payload = {
        "name": "TEST_Agent Rao",
        "role": "Senior Consultant",
        "phone": "9999900000",
        "email": "agent@example.com",
        "experience": "5 years",
        "bio": "TEST bio",
        "active": True,
    }
    r = auth_client.post(f"{BASE_URL}/api/agents", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == payload["name"]
    assert "id" in data
    state["agent_id"] = data["id"]


def test_agent_visible_active(client):
    r = client.get(f"{BASE_URL}/api/agents")
    assert state["agent_id"] in [a["id"] for a in r.json()]


def test_agent_update_deactivate(auth_client):
    aid = state["agent_id"]
    payload = {
        "name": "TEST_Agent Rao",
        "role": "Lead Consultant",
        "phone": "9999900000",
        "email": "agent@example.com",
        "experience": "6 years",
        "bio": "TEST bio updated",
        "active": False,
    }
    r = auth_client.put(f"{BASE_URL}/api/agents/{aid}", json=payload)
    assert r.status_code == 200
    assert r.json()["active"] is False
    # not in active list
    r2 = requests.get(f"{BASE_URL}/api/agents")
    assert aid not in [a["id"] for a in r2.json()]


def test_agent_delete(auth_client):
    aid = state["agent_id"]
    r = auth_client.delete(f"{BASE_URL}/api/agents/{aid}")
    assert r.status_code == 200


# ---- Newsletter ----
def test_newsletter_subscribe_public(client):
    import uuid as _uuid
    email = f"test_{_uuid.uuid4().hex[:8]}@example.com"
    state["nl_email"] = email
    r = client.post(f"{BASE_URL}/api/newsletter", json={"email": email})
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert "Subscribed" in data.get("message", "")


def test_newsletter_duplicate(client):
    email = state["nl_email"]
    r = client.post(f"{BASE_URL}/api/newsletter", json={"email": email})
    assert r.status_code == 200
    assert "Already subscribed" in r.json().get("message", "")


def test_newsletter_invalid_email(client):
    r = client.post(f"{BASE_URL}/api/newsletter", json={"email": "not-an-email"})
    assert r.status_code == 422


def test_newsletter_list_requires_auth():
    r = requests.get(f"{BASE_URL}/api/newsletter")
    assert r.status_code == 401


def test_newsletter_list_admin(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/newsletter")
    assert r.status_code == 200
    items = r.json()
    match = next((s for s in items if s["email"] == state["nl_email"]), None)
    assert match is not None
    state["nl_id"] = match["id"]


def test_newsletter_delete(auth_client):
    sid = state["nl_id"]
    r = auth_client.delete(f"{BASE_URL}/api/newsletter/{sid}")
    assert r.status_code == 200
    items = auth_client.get(f"{BASE_URL}/api/newsletter").json()
    assert sid not in [s["id"] for s in items]


# ---- Properties by IDs (used by wishlist + compare) ----
def test_properties_by_ids(auth_client):
    # create two properties
    payload_base = {
        "property_type": "Apartment",
        "location": "Guntur",
        "price": 3000000,
        "area_sqft": 1200,
        "bedrooms": 2,
        "bathrooms": 2,
    }
    ids = []
    for i in range(2):
        p = {**payload_base, "name": f"TEST_BY_IDS_{i}"}
        r = auth_client.post(f"{BASE_URL}/api/properties", json=p)
        assert r.status_code == 200
        ids.append(r.json()["id"])
    state["byid_ids"] = ids

    # POST by-ids - public endpoint
    r = requests.post(f"{BASE_URL}/api/properties/by-ids", json={"ids": ids})
    assert r.status_code == 200, r.text
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 2
    assert set([p["id"] for p in items]) == set(ids)


def test_properties_by_ids_empty():
    r = requests.post(f"{BASE_URL}/api/properties/by-ids", json={"ids": []})
    assert r.status_code == 200
    assert r.json() == []


def test_properties_by_ids_cleanup(auth_client):
    for pid in state.get("byid_ids", []):
        auth_client.delete(f"{BASE_URL}/api/properties/{pid}")


# ---- Admin Stats includes new counts ----
def test_admin_stats_new_counts(auth_client):
    r = auth_client.get(f"{BASE_URL}/api/admin/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ["blogs", "agents", "newsletter_subs"]:
        assert k in data and isinstance(data[k], int)
