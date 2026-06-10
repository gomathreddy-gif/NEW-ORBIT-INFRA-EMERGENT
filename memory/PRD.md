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
- ✅ Property listing with filters (location, type, beds, price)
- ✅ Property detail page with gallery, amenities, nearby places, video tour
- ✅ Public-facing pages with luxury design (Playfair Display + Plus Jakarta Sans)
- ✅ EN/TE language toggle, WhatsApp floating button
- ✅ Testimonials section (3 seeded reviews)
- ✅ Full responsive design + light mode only
- ✅ End-to-end tested: 23/23 backend pytest pass, 100% frontend flows

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
