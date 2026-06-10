# Orbit Infra Projects — PRD

## Original Problem Statement
Premium luxury real estate website "Orbit Infra Projects" (tagline: *Your Trusted Real Estate Partner*) with full property management CRM for Andhra Pradesh. Admin can manage properties, leads, site visits, home loan applications, and customer enquiries. Contact number: 9441085800.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + lucide-react (Playfair Display + Plus Jakarta Sans fonts; Navy #0A2240 + Gold #D4AF37 + White)
- **Backend**: FastAPI + Motor (MongoDB)
- **Auth**: JWT (bcrypt password hashing, cookie + Bearer header)
- **Storage**: Emergent built-in object storage for property images
- **i18n**: English + Telugu (light theme only)

## User Personas
- **Property Buyer**: Browses listings, books site visits, applies for loan, contacts via WhatsApp/phone
- **Admin**: Manages properties (CRUD), reviews leads/visits/loan applications, tracks notifications

## Core Requirements (static)
1. Public site: Home, Properties (with filters), Property Detail, About, Services, Home Loan (EMI calculator), Contact
2. Admin panel: Dashboard, Property management with image upload, Leads/Visits/Loans management
3. WhatsApp click-to-chat (no API needed for MVP)
4. In-app notifications on each customer enquiry
5. Multi-language (English + Telugu)

## What's Been Implemented (2026-02)
- ✅ FastAPI backend with JWT auth (admin seeded from env)
- ✅ Properties CRUD with advanced filters
- ✅ Image upload via Emergent object storage
- ✅ Leads endpoint (public submission, admin management)
- ✅ Auto-notifications on each lead
- ✅ Admin dashboard with stats + recent leads + notifications
- ✅ EMI calculator + loan application
- ✅ Contact + site visit + callback forms
- ✅ Property listing with filters
- ✅ Property detail page with gallery, amenities, nearby places, video tour
- ✅ Luxury design (Playfair + Plus Jakarta Sans, Navy + Gold)
- ✅ EN/TE language toggle, WhatsApp floating button
- ✅ Testimonials section
- ✅ End-to-end tested: 23/23 backend pytest (iter 1)

### Phase 2 Additions (2026-02)
- ✅ Blog: admin CRUD + public listing/detail pages with cover images, tags, slugs
- ✅ Agent Profiles: admin CRUD + public `/agents` page with avatar, contact links, WhatsApp
- ✅ Wishlist: localStorage-based, header badge, dedicated `/wishlist` page
- ✅ Property Comparison: localStorage-based, up to 4 properties, side-by-side table with amenity matrix
- ✅ Newsletter: public subscribe (footer + homepage CTA), admin viewer with CSV export
- ✅ Hydration race fix in WishlistContext
- ✅ End-to-end tested: 47/47 backend pytest pass

### Phase 3 Additions (2026-02)
- ✅ Live Maps: Leaflet + OpenStreetMap (no API key); `/properties` page Grid/Map toggle; custom navy/gold pin marker; property detail map; admin enters lat/lng per property
- ✅ Floor Plan PDFs: admin uploads multiple PDFs per property; customers download from property detail page (Emergent storage)
- ✅ Customer login: JWT email/password signup (`/register`) + sign-in (`/login`); customer dashboard at `/account` with avatar, saved searches, wishlist/compare quick links, logout
- ✅ Saved Searches: customers can save any filter combo with a name from Properties page; replay or delete from `/account`
- ✅ AuthContext now supports admin + customer; ProtectedAdmin role-gate enforced
- ✅ End-to-end tested: 20/20 Phase 3 backend pytest pass, ~95% frontend

## Prioritized Backlog
### P1 (Phase 2)
- WhatsApp business API / Twilio integration for admin notifications
- Email notifications via Resend/SendGrid
- Property comparison & wishlist
- Blog section
- Agent profiles
- Newsletter subscription

### P2
- Property analytics & view tracking
- Customer login (favorites, saved searches)
- Live Google Maps with property pins
- Floor plan upload (PDF)
- Video upload to object storage
- Reviews moderation queue
