# TrustiFix — Client Technical Brief

**Product:** On-demand service marketplace for Kampala  
**Status:** Working product prototype (demo-ready)  
**Stack:** React · TypeScript · Vite · prepared for Supabase  

---

## 1. What we built

TrustiFix connects **customers** with verified **service providers** (mechanics, home, tech, and more). Customers book with a **wallet hold**, track and message providers, and pay only when the job is done. **Admins** oversee applications, verification, disputes, and safety alerts.

The system follows the original Lovable marketplace concept (roles, bookings, wallet, trust), rebuilt and extended as a branded web application with Kampala-focused UX.

---

## 2. Who uses it

| Role | What they do |
|---|---|
| **Customer** | Sign up, browse providers, book, pay via wallet hold, review, message |
| **Provider** | Receive jobs, update status, earn payouts, manage profile |
| **Admin** | Approve applications, toggle verification, handle disputes & panic alerts |
| **Guest** | View marketing/home & trust pages; must sign in to use core features |

---

## 3. How the system works (business flow)

1. User creates an account (name, username, email, phone, password) or signs in.  
2. Customer finds a nearby provider and books a service.  
3. Funds are **held in the wallet** until the job is completed.  
4. Provider accepts → en route → in progress → completed.  
5. On completion, payout is released (minus platform fee in the product model).  
6. Customer can review; either party can open a dispute.  
7. Safety: panic alerts notify admin (and linked booking contacts).  

**Also included:** notifications, messaging, events, auction, blog, help chat, live activity feed.

---

## 4. How it was built (technology)

| Layer | Choice | Purpose |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast, modern web app |
| Navigation | React Router | Pages for every major flow |
| App logic | Context stores (Auth, Platform, Location) | Bookings, wallet, chat, location |
| Access control | Role-based permissions (RBAC) | Customer / Provider / Admin gates |
| UI | Custom design system | Navy + orange brand, mobile-responsive |

---

## 5. Backend status (important for expectations)

| Mode | What it means |
|---|---|
| **Current default: Local demo** | Data is stored in the browser (`localStorage`). Ideal for demos and iteration—no server required. |
| **Production path: Supabase** | Schema and env wiring are prepared. Connecting Supabase enables real cloud auth, database, and server-side rules. |

**Client-friendly summary:**  
You have a complete clickable product today. For live users and real money, we activate the prepared cloud backend (Supabase) and payment integrations.

---

## 6. Security — what is in place vs next steps

### In place now (product / app layer)
- Sign-in / sign-up required before core actions  
- Protected pages (wallet, messages, admin, bookings, etc.)  
- Role-based access (admin cannot be “clicked into” without credentials)  
- Admin credentials are **not autofilled** — typed by the user  
- Trust model: wallet hold/release, verification badges, disputes, panic button  

### Required before full production launch
- Supabase Auth with proper password hashing  
- Database **Row Level Security (RLS)** so users only access their own data  
- HTTPS hosting and secrets management  
- Real payment provider (e.g. mobile money / card) with audit trails  
- Operational monitoring and backups  

**Honest positioning:**  
Access control and trust workflows are built into the product. Server-enforced security and payments are the next production hardening step—not a redesign.

---

## 7. Roadmap you can share

| Phase | Scope | Outcome |
|---|---|---|
| **Phase 1 — Done** | Full UI + marketplace flows + admin + local persistence | Demo & stakeholder validation |
| **Phase 2 — Launch prep** | Supabase auth/DB, payments, deploy to hosting | Real users & real transactions |
| **Phase 3 — Scale** | SMS/email alerts, richer admin, analytics, tracking polish | Growth & operations |

---

## 8. One-paragraph elevator pitch

> TrustiFix is a Kampala on-demand services marketplace: customers book verified providers with wallet protection; providers manage jobs and earnings; admins oversee safety and verification. The product was built as a modern React application with complete user flows ready for demonstration. Data currently runs in a local demo mode for speed; a Supabase backend path is prepared for production. Security today includes sign-in gates and role permissions; launch hardening adds server-side auth, database rules, and live payments.

---

## 9. Demo credentials (internal only — do not print on client slides)

| Account | How to access |
|---|---|
| New customer | **Create account** on `/auth` |
| Admin | Username `admin` · Password `admin35` (typed manually) |
| Quick demos | Optional Customer / Provider demo buttons on auth page |

---

*Document generated for stakeholder / client communication. Update Phase 2 dates when a launch schedule is agreed.*
