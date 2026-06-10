from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Query, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os, uuid, logging, io
import bcrypt, jwt, requests

# ---- Setup ----
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "orbit-infra"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orbit")

app = FastAPI(title="Orbit Infra Projects API")
api = APIRouter(prefix="/api")

# ---- Storage ----
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---- Auth utils ----
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_token(uid: str, email: str) -> str:
    payload = {"sub": uid, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(403, "Forbidden")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ---- Models ----
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile: Optional[str] = ""

class SavedSearchInput(BaseModel):
    name: str
    filters: dict

class PropertyInput(BaseModel):
    name: str
    property_type: str  # Apartment, Villa, Plot, Commercial, House
    location: str
    city: Optional[str] = "Andhra Pradesh"
    price: float
    area_sqft: float
    bedrooms: int = 0
    bathrooms: int = 0
    status: str = "Available"  # Available, Sold, Under Construction, Ready To Move, Upcoming
    project_status: str = "Ongoing"  # Ongoing, Completed, Upcoming
    description: str = ""
    amenities: List[str] = []
    floor_plans: List[str] = []
    floor_plan_pdfs: List[dict] = []  # [{name, path}]
    nearby_schools: List[str] = []
    nearby_hospitals: List[str] = []
    nearby_shopping: List[str] = []
    video_url: Optional[str] = ""
    map_url: Optional[str] = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    featured: bool = False
    images: List[str] = []  # storage paths

class LeadInput(BaseModel):
    name: str
    mobile: str
    email: Optional[str] = ""
    message: Optional[str] = ""
    lead_type: str = "enquiry"  # enquiry, site_visit, loan, callback
    property_id: Optional[str] = None
    property_name: Optional[str] = None
    visit_date: Optional[str] = None
    visit_time: Optional[str] = None
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None
    property_value: Optional[float] = None

class LeadStatusUpdate(BaseModel):
    status: str  # New, Contacted, Follow Up, Closed

class TestimonialInput(BaseModel):
    name: str
    location: Optional[str] = ""
    rating: int = 5
    message: str
    avatar_url: Optional[str] = ""
    approved: bool = True

class BlogInput(BaseModel):
    title: str
    slug: Optional[str] = ""
    excerpt: str = ""
    content: str
    cover_image: Optional[str] = ""
    tags: List[str] = []
    author: str = "Orbit Infra Team"
    published: bool = True

class AgentInput(BaseModel):
    name: str
    role: str = "Property Consultant"
    phone: str = ""
    email: str = ""
    experience: str = ""
    bio: str = ""
    avatar: Optional[str] = ""
    active: bool = True

class NewsletterInput(BaseModel):
    email: EmailStr

# ---- Startup ----
@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.properties.create_index("id", unique=True)
    await db.leads.create_index("id", unique=True)
    await db.testimonials.create_index("id", unique=True)
    await db.notifications.create_index("id", unique=True)
    await db.blogs.create_index("id", unique=True)
    await db.blogs.create_index("slug")
    await db.agents.create_index("id", unique=True)
    await db.newsletter_subs.create_index("email", unique=True)
    await db.newsletter_subs.create_index("id", unique=True)
    await db.saved_searches.create_index("id", unique=True)
    await db.saved_searches.create_index("user_id")

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Orbit Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()},
                                  {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Admin password updated")

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        seed_t = [
            {"id": str(uuid.uuid4()), "name": "Ramesh Kumar", "location": "Vijayawada",
             "rating": 5, "message": "Orbit Infra helped us find our dream villa. Their site visit and loan assistance was top class.",
             "avatar_url": "", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Lakshmi Devi", "location": "Guntur",
             "rating": 5, "message": "Trustworthy partners. They handled all legal verification and made the buying process smooth.",
             "avatar_url": "", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Suresh Reddy", "location": "Visakhapatnam",
             "rating": 5, "message": "Got my home loan approved in 7 days. Excellent service and transparent process.",
             "avatar_url": "", "approved": True, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.testimonials.insert_many(seed_t)

    # Init storage (best-effort)
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed: {e}")

# ---- Auth Routes ----
@api.post("/auth/login")
async def login(body: LoginInput, response: Response):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["email"])
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=604800, path="/")
    return {"token": token, "user": {"id": user["id"], "email": user["email"],
                                      "name": user["name"], "role": user["role"]}}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request)
    return user

@api.post("/auth/register")
async def register(body: RegisterInput, response: Response):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "mobile": body.mobile or "",
        "role": "customer",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=604800, path="/")
    return {"token": token, "user": {"id": user_id, "email": email, "name": body.name, "role": "customer"}}

# ---- Property Routes ----
@api.get("/properties")
async def list_properties(
    location: Optional[str] = None,
    property_type: Optional[str] = None,
    status: Optional[str] = None,
    project_status: Optional[str] = None,
    bedrooms: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_area: Optional[float] = None,
    featured: Optional[bool] = None,
    limit: int = 50,
):
    q = {}
    if location: q["location"] = {"$regex": location, "$options": "i"}
    if property_type: q["property_type"] = property_type
    if status: q["status"] = status
    if project_status: q["project_status"] = project_status
    if bedrooms is not None: q["bedrooms"] = {"$gte": bedrooms}
    if min_price is not None or max_price is not None:
        q["price"] = {}
        if min_price is not None: q["price"]["$gte"] = min_price
        if max_price is not None: q["price"]["$lte"] = max_price
    if min_area is not None: q["area_sqft"] = {"$gte": min_area}
    if featured is not None: q["featured"] = featured
    items = await db.properties.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return items

@api.get("/properties/{pid}")
async def get_property(pid: str):
    p = await db.properties.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Property not found")
    return p

@api.post("/properties")
async def create_property(body: PropertyInput, request: Request):
    await get_current_admin(request)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.properties.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/properties/{pid}")
async def update_property(pid: str, body: PropertyInput, request: Request):
    await get_current_admin(request)
    update = body.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.properties.update_one({"id": pid}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Property not found")
    p = await db.properties.find_one({"id": pid}, {"_id": 0})
    return p

@api.delete("/properties/{pid}")
async def delete_property(pid: str, request: Request):
    await get_current_admin(request)
    res = await db.properties.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Property not found")
    return {"ok": True}

# ---- Image Upload ----
@api.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    await get_current_admin(request)
    ext = (file.filename or "img").split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(400, "Invalid image format")
    path = f"{APP_NAME}/properties/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or f"image/{ext}")
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api.post("/upload-pdf")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    await get_current_admin(request)
    ext = (file.filename or "doc").split(".")[-1].lower()
    if ext != "pdf":
        raise HTTPException(400, "Only PDF files allowed")
    name = (file.filename or "floorplan.pdf").rsplit("/", 1)[-1]
    path = f"{APP_NAME}/floorplans/{uuid.uuid4()}.pdf"
    data = await file.read()
    result = put_object(path, data, "application/pdf")
    return {"path": result["path"], "name": name, "url": f"/api/files/{result['path']}"}

@api.get("/files/{path:path}")
async def serve_file(path: str):
    try:
        data, ctype = get_object(path)
        return StreamingResponse(io.BytesIO(data), media_type=ctype,
                                 headers={"Cache-Control": "public, max-age=86400"})
    except Exception:
        raise HTTPException(404, "File not found")

# ---- Leads / Enquiries ----
async def create_notification(title: str, body_text: str, lead_id: str = None):
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "title": title,
        "body": body_text,
        "lead_id": lead_id,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

@api.post("/leads")
async def create_lead(body: LeadInput):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "New"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.leads.insert_one(doc)
    type_label = {
        "enquiry": "New Enquiry",
        "site_visit": "Site Visit Request",
        "loan": "Home Loan Application",
        "callback": "Callback Request",
        "contact": "Contact Form",
    }.get(body.lead_type, "New Lead")
    pname = f" for {body.property_name}" if body.property_name else ""
    await create_notification(
        f"{type_label} from {body.name}",
        f"Mobile: {body.mobile}{pname}. Message: {body.message or '-'}",
        doc["id"],
    )
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}

@api.get("/leads")
async def list_leads(request: Request, lead_type: Optional[str] = None, status: Optional[str] = None):
    await get_current_admin(request)
    q = {}
    if lead_type: q["lead_type"] = lead_type
    if status: q["status"] = status
    items = await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.patch("/leads/{lid}")
async def update_lead(lid: str, body: LeadStatusUpdate, request: Request):
    await get_current_admin(request)
    res = await db.leads.update_one({"id": lid}, {"$set": {"status": body.status,
                                                            "updated_at": datetime.now(timezone.utc).isoformat()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Lead not found")
    return {"ok": True}

@api.delete("/leads/{lid}")
async def delete_lead(lid: str, request: Request):
    await get_current_admin(request)
    await db.leads.delete_one({"id": lid})
    return {"ok": True}

# ---- Notifications ----
@api.get("/notifications")
async def list_notifications(request: Request, only_unread: bool = False):
    await get_current_admin(request)
    q = {"read": False} if only_unread else {}
    items = await db.notifications.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api.post("/notifications/{nid}/read")
async def mark_read(nid: str, request: Request):
    await get_current_admin(request)
    await db.notifications.update_one({"id": nid}, {"$set": {"read": True}})
    return {"ok": True}

@api.post("/notifications/read-all")
async def mark_all_read(request: Request):
    await get_current_admin(request)
    await db.notifications.update_many({"read": False}, {"$set": {"read": True}})
    return {"ok": True}

# ---- Testimonials ----
@api.get("/testimonials")
async def list_testimonials(approved_only: bool = True):
    q = {"approved": True} if approved_only else {}
    items = await db.testimonials.find(q, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items

@api.post("/testimonials")
async def create_testimonial(body: TestimonialInput, request: Request):
    await get_current_admin(request)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.delete("/testimonials/{tid}")
async def delete_testimonial(tid: str, request: Request):
    await get_current_admin(request)
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}

# ---- Stats ----
@api.get("/admin/stats")
async def admin_stats(request: Request):
    await get_current_admin(request)
    return {
        "total_properties": await db.properties.count_documents({}),
        "available": await db.properties.count_documents({"status": "Available"}),
        "sold": await db.properties.count_documents({"status": "Sold"}),
        "total_leads": await db.leads.count_documents({}),
        "new_leads": await db.leads.count_documents({"status": "New"}),
        "site_visits": await db.leads.count_documents({"lead_type": "site_visit"}),
        "loan_requests": await db.leads.count_documents({"lead_type": "loan"}),
        "enquiries": await db.leads.count_documents({"lead_type": "enquiry"}),
        "unread_notifications": await db.notifications.count_documents({"read": False}),
        "blogs": await db.blogs.count_documents({}),
        "agents": await db.agents.count_documents({}),
        "newsletter_subs": await db.newsletter_subs.count_documents({}),
    }

# ---- Blog Routes ----
@api.get("/blogs")
async def list_blogs(published_only: bool = True, limit: int = 50):
    q = {"published": True} if published_only else {}
    items = await db.blogs.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return items

@api.get("/blogs/{slug}")
async def get_blog(slug: str):
    b = await db.blogs.find_one({"slug": slug}, {"_id": 0})
    if not b:
        b = await db.blogs.find_one({"id": slug}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Blog not found")
    return b

@api.post("/blogs")
async def create_blog(body: BlogInput, request: Request):
    await get_current_admin(request)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    if not doc.get("slug"):
        base = "".join(c if c.isalnum() else "-" for c in doc["title"].lower())[:60].strip("-")
        doc["slug"] = f"{base}-{doc['id'][:8]}"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.blogs.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/blogs/{bid}")
async def update_blog(bid: str, body: BlogInput, request: Request):
    await get_current_admin(request)
    upd = body.model_dump()
    upd["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.blogs.update_one({"id": bid}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(404, "Blog not found")
    b = await db.blogs.find_one({"id": bid}, {"_id": 0})
    return b

@api.delete("/blogs/{bid}")
async def delete_blog(bid: str, request: Request):
    await get_current_admin(request)
    await db.blogs.delete_one({"id": bid})
    return {"ok": True}

# ---- Agent Routes ----
@api.get("/agents")
async def list_agents(active_only: bool = True):
    q = {"active": True} if active_only else {}
    items = await db.agents.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api.post("/agents")
async def create_agent(body: AgentInput, request: Request):
    await get_current_admin(request)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.agents.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.put("/agents/{aid}")
async def update_agent(aid: str, body: AgentInput, request: Request):
    await get_current_admin(request)
    res = await db.agents.update_one({"id": aid}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Agent not found")
    a = await db.agents.find_one({"id": aid}, {"_id": 0})
    return a

@api.delete("/agents/{aid}")
async def delete_agent(aid: str, request: Request):
    await get_current_admin(request)
    await db.agents.delete_one({"id": aid})
    return {"ok": True}

# ---- Newsletter ----
@api.post("/newsletter")
async def subscribe_newsletter(body: NewsletterInput):
    email = body.email.lower()
    existing = await db.newsletter_subs.find_one({"email": email})
    if existing:
        return {"ok": True, "message": "Already subscribed"}
    await db.newsletter_subs.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True, "message": "Subscribed"}

@api.get("/newsletter")
async def list_newsletter(request: Request):
    await get_current_admin(request)
    items = await db.newsletter_subs.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api.delete("/newsletter/{sid}")
async def delete_newsletter(sid: str, request: Request):
    await get_current_admin(request)
    await db.newsletter_subs.delete_one({"id": sid})
    return {"ok": True}

# ---- Saved Searches (customer) ----
@api.get("/saved-searches")
async def list_saved_searches(request: Request):
    user = await get_current_user(request)
    items = await db.saved_searches.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api.post("/saved-searches")
async def create_saved_search(body: SavedSearchInput, request: Request):
    user = await get_current_user(request)
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": body.name,
        "filters": body.filters,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.saved_searches.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.delete("/saved-searches/{sid}")
async def delete_saved_search(sid: str, request: Request):
    user = await get_current_user(request)
    await db.saved_searches.delete_one({"id": sid, "user_id": user["id"]})
    return {"ok": True}

# ---- Properties by IDs (for compare) ----
@api.post("/properties/by-ids")
async def properties_by_ids(payload: dict):
    ids = payload.get("ids", [])
    if not ids:
        return []
    items = await db.properties.find({"id": {"$in": ids}}, {"_id": 0}).to_list(20)
    return items

@api.get("/")
async def root():
    return {"app": "Orbit Infra Projects API", "status": "ok"}

# ---- Mount ----
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
