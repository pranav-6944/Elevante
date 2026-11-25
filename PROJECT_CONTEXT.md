# ELEVANTE — Project Context

> **Current Status:** Phase 7 (Admin Dashboard) complete — awaiting explicit approval before Phase 8 implementation.  
> **Primary Source of Truth:** [ProjectBrief.md](./ProjectBrief.md)

---

## 1. Short Description of ELEVANTE

**ELEVANTE** is a production-ready, full-stack digital solutions agency website and client service-management platform founded by **Pranav Lamkhade** with **Omkar Sable** as Co-Founder.

The agency delivers:
- Website development & 3D web experiences
- Full-stack application development
- Data analytics & Excel/CSV automation
- AI solutions
- Logo design & brand identity
- Professional document and presentation design

Rather than serving as a static brochure or demo portfolio, ELEVANTE combines:
1. A high-converting, SEO/AEO/GEO-optimized **Public Website & CMS**.
2. A **Dynamic Service Catalog & Service-Specific Brief Builder**.
3. An isolated **Customer Portal** for submitting requirements, uploading reference files, reviewing quotations, messaging, and downloading deliverables.
4. A role-based **Admin Dashboard** for end-to-end operations, CRM, CMS, media, analytics, and auditability.

---

## 2. Business Objectives

- **Communicate Premium Agency Positioning:** Present Elevante's brand identity, capabilities, founders, portfolio, and process clearly to convert inbound leads.
- **Standardize Intake via Dynamic Briefs:** Allow admins to define custom requirement forms per service without code changes so every project starts with complete, structured inputs.
- **Operate a Real Quotation-Based Workflow:** Manage the 14-step lifecycle from service discovery and requirement submission through clarification, quotation review, active delivery, and deliverable handoff.
- **Maintain Payment-Ready Architecture:** Avoid any simulated or fake payment logic while structuring quotation and payment schemas cleanly for future payment gateway integration.
- **Support Real Business Scale:** Design queries, caching, storage, and security for thousands of public visitors and growing customer, project, and file records.
- **Protect Client & Business Data:** Enforce strict server-side authorization and database Row Level Security (RLS) so customers access only their own projects, quotes, messages, and files.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router), React, TypeScript | Server-first rendering (SSR/SSG/ISR), routing, Server Actions, Route Handlers |
| **Styling & UI** | Tailwind CSS, `shadcn/ui` | Design tokens, accessible composable UI primitives, responsive layout |
| **Motion & 3D** | Motion for React, Three.js / React Three Fiber | Purposeful UI transitions and selective 3D web showcase experiences |
| **Backend Logic** | Next.js Server Actions & Route Handlers | Server-side mutations, auth callbacks, rate-limited endpoints, upload orchestration |
| **Database** | Supabase PostgreSQL | Central relational data store, migrations, RPCs, Row Level Security |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | Email/password auth, email verification, password reset, cookie-based SSR sessions |
| **File Storage** | Supabase Storage | Public media bucket + private signed-URL buckets for attachments & deliverables |
| **Validation** | Zod + React Hook Form | Shared client/server validation schemas, including dynamic service form validation |
| **Email** | Resend | Transactional notifications (enquiries, quotes, clarifications, deliverables) + production SMTP |
| **Icons & Graphics** | Lucide React + Custom SVGs | UI iconography and safe empty-state / error / brand illustrations |
| **Deployment** | Vercel + Supabase + Git/GitHub | Managed edge/serverless hosting, preview deployments, managed Postgres/Auth/Storage |

---

## 4. Brand Identity & Existing Assets

### Brand Colors (`ProjectBrief.md` §2)
- **Primary Gradient:** `linear-gradient(100deg, #17264F 0%, #245B70 52%, #319C78 100%)`
- **Deep Navy:** `#17264F`
- **Teal Blue:** `#245B70`
- **Growth Green:** `#319C78`
- **Warm Off-White:** `#F5F6F2`
- **White:** `#FFFFFF`

### Existing Workspace Brand Files (Verified)
- `Logo.png` (`818×613`)
- `Horizontal-E-Logo.png` (`2110×527`)
- `Vertical-E-Logo.png` (`1296×929`)
- `favicon_io/` (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`)

> **Asset Note:** In Phase 1/2, these root assets will be moved/copied into `public/logos/` and `public/` cleanly, and `site.webmanifest` (currently blank `name`, `short_name`, and `#ffffff` theme color) will be updated with Elevante metadata.

---

## 5. Application Architecture Summary

ELEVANTE is structured as a modular full-stack Next.js monolith backed by Supabase:

1. **Public Website (`src/app/(marketing)`)** — Home, About, Services, Service Details, Portfolio, Project Details, Contact, FAQ, Privacy Policy, Terms & Conditions.
2. **Authentication (`src/app/(auth)`)** — Register, Login, Email Verification notice/callback, Forgot Password, Reset Password.
3. **Customer Portal (`src/app/dashboard`)** — Overview, Start a Project, My Projects, Project Details, Quotations, Messages, Notifications, My Files, Account Settings.
4. **Admin Dashboard (`src/app/admin`)** — Overview, Customers, Services, Categories, Dynamic Form Builder, Projects/Orders, Enquiries, Quotations, Portfolio, Website Content (Testimonials/FAQs/Sections), Media Library, Team & Roles, Analytics, Notifications, Audit Logs, Settings.
5. **Backend & Data Layer (`src/lib/`, `supabase/`)** — Supabase SSR/Admin clients, auth & RBAC guards, Zod schemas, domain service modules, email service, rate limiting, SQL migrations, and RLS policies.

*(Full technical breakdown in [ARCHITECTURE.md](./ARCHITECTURE.md) and [DATABASE_DESIGN.md](./DATABASE_DESIGN.md).)*

---

## 6. Coding & Engineering Conventions

1. **Strict TypeScript:** Enable strict mode; eliminate unnecessary `any` types; type all DB payloads, form schemas, and action return envelopes (`ActionResult<T>`).
2. **Server-First Rendering:** Default to React Server Components; add `'use client'` only at interactive leaf boundaries (forms, filters, modals, animations, 3D canvas).
3. **Simplicity & Maintainability:** Follow minimal, clean, modular design—no speculative abstractions, no duplicated validation or query logic, no unnecessary npm packages.
4. **Trust Boundary Discipline:**
   - Validate every user input on the server with Zod.
   - Enforce authentication and granular RBAC permissions in Server Actions and Route Handlers before any mutation or sensitive read.
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` to client bundles (`NEXT_PUBLIC_*` restricted strictly to public URL/anon key/site URL).
5. **Database-First Persistence:** Manage all schema changes via timestamped SQL migrations in `supabase/migrations/`. Never use client-side browser storage as primary persistence or permanent mock data for implemented features.
6. **UI Resilience & Accessibility:** Every interactive surface implements loading skeletons, empty states, clear validation errors, keyboard navigation, responsive mobile-first layouts, and safe fallbacks if SVGs, 3D canvases, or media fail to load.
7. **Documentation Hygiene:** Update `PROJECT_CONTEXT.md`, `IMPLEMENTATION_ROADMAP.md`, `DEVELOPMENT_LOG.md`, and `AI_NOTES.md` at the completion of every phase.

---

## 7. Key Development Decisions & Documented Assumptions

Where `ProjectBrief.md` left implementation details unspecified, the following pragmatic assumptions are recorded for review:

| Topic | Decision / Assumption | Status |
| :--- | :--- | :--- |
| **Public Enquiries vs Project Requests** | Public `/contact` submissions without an account go to a dedicated `enquiries` table (managed in `/admin/enquiries`) and can optionally link/convert to a `project_requests` record. | Proposed Assumption |
| **Auth Requirement for Project Submission** | Guests browse services publicly, but creating a project request and uploading private reference files requires an authenticated customer account (preventing anonymous storage abuse). | Proposed Assumption |
| **Dynamic Form Immutability** | `project_form_responses` and `project_requests.form_snapshot` capture field keys, labels, and types at submission time so future admin edits to `service_form_fields` never corrupt past submissions. | Architectural Decision |
| **Pricing & Quotations** | Services support flexible pricing modes (`quote_only`, `starting_from`, `fixed_estimate`). Quotations support structured line items, optional tax/discount, currency configurable in settings (default `INR`/`USD`), expiry dates, and customer actions (`accept`, `request_revision`, `decline`). | Proposed Assumption |
| **RBAC + Team Showcase Split** | Access control uses `roles` (`customer`, `staff`, `admin`, `super_admin`) + `permissions` + `role_permissions`; public founder/team display uses `team_members` optionally linked to `profiles`. | Proposed Assumption |
| **Storage Bucket Segmentation** | Three Supabase Storage buckets: `public-media` (public read, admin write), `project-attachments` (private, signed URLs), `project-deliverables` (private, signed URLs). | Architectural Decision |
| **Serverless Rate Limiting** | Implement a DB/RPC-backed (or optional Redis-backed) rate limiter for `/api/contact`, auth-adjacent endpoints, and upload signing rather than volatile in-memory maps. | Architectural Decision |
| **3D & Motion Budget** | Dynamically import Three.js / R3F client-only with lightweight SSR/SVG fallback and `prefers-reduced-motion` support so Core Web Vitals stay strong on mobile. | Architectural Decision |
| **Official Agency Details & Legal Copy** | Exact agency support email, business address, Omkar Sable's bio/headshot, and final legal policy text will be stored in `platform_settings` / CMS (`site_sections`) for admin updates without fabricated testimonials or reviews. | Proposed Assumption |
| **Fresh Git Repository** | Old prototype Git history was discarded and replaced with a clean `main` branch (`git init -b main`); a new GitHub remote will be linked when ready to push. Existing `Logo.png`, `Horizontal-E-Logo.png`, `Vertical-E-Logo.png`, and `favicon_io/` assets are preserved for Phase 1/2. | Resolved |

---

## 8. Current Implementation Status

- **Active Phase:** Phase 7 — Admin Dashboard (**Completed**)
- **Application Code:** Complete Admin operations suite under `/admin` (`Overview`, `Customers`, `Enquiries`, `Projects` + `[id]` detail controls, `Quotations` with server-computed line-item totals, `Portfolio` + `Testimonials` CMS, `Team & RBAC` with Super Admin role/matrix controls, `Analytics`, `Audit Logs`, and `Platform Settings`), alongside live cached public `/portfolio`, `/portfolio/[slug]`, homepage Featured Work & Testimonials, and `/sitemap.xml` wiring.
- **Next Recommended Phase:** Phase 8 — End-to-End Project & Quotation Workflow (awaiting explicit approval)

