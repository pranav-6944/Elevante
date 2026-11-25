# ELEVANTE — Implementation Roadmap

> **Primary Reference:** [ProjectBrief.md](./ProjectBrief.md)  
> **Workflow Rule:** Complete one phase at a time, verify all checks, update documentation, and wait for explicit approval before starting the next phase.

---

## Phase Dependency Overview

```text
Phase 0 (Analysis & Docs)
   └─► Phase 1 (Foundation & Design System)
          ├─► Phase 2 (Brand Identity & Public Shell)
          └─► Phase 3 (Database, Storage & RLS)
                 ├─► Phase 4 (Auth & RBAC)
                 │      ├─► Phase 5 (Dynamic Services, Form Builder & CMS)
                 │      │      ├─► Phase 6 (Customer Portal)
                 │      │      └─► Phase 7 (Admin Dashboard)
                 │      │             └─► Phase 8 (14-Step Project & Quotation Workflow)
                 │      └──────────────────────► Phase 9 (SEO/AEO/GEO, Perf, Security Audit)
                 └─────────────────────────────► Phase 10 (E2E Testing & Production Launch)
```

> **Key Dependency Resolution (Phase 2 vs Phases 3 & 5):**  
> Per `ProjectBrief.md`, public services, portfolio items, FAQs, testimonials, and routine marketing content must be **database-driven** (never permanent mock data). Therefore, **Phase 2** builds the Brand Identity, Responsive Navigation, Hero, Static Agency/Legal Pages, Custom SVG Fallbacks, and structural sections, while **Phase 5** and **Phase 7** wire dynamic database catalogs (`/services`, `/portfolio`, `/faq`, CMS blocks, and `/contact` DB persistence) directly after Phase 3 (Database) and Phase 4 (Auth/Admin RBAC) exist.

---

## Phase 0 — Project Analysis and Architecture *(Completed)*
- **Scope:** Analyze `ProjectBrief.md`, audit workspace & Git state, identify risks/ambiguities/assumptions, define system architecture, relational schema, and phased roadmap.
- **Deliverables:** `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `IMPLEMENTATION_ROADMAP.md`, `DEVELOPMENT_LOG.md`, `AI_NOTES.md`.
- **Completion Criteria:** All requirements mapped, risks documented, zero application code written prematurely.

---

## Phase 1 — Project Foundation *(Completed)*
- **Prerequisites:** Phase 0 approved; fresh Git `main` branch initialized and clean (brand logos and `favicon_io/` preserved).
- **Features & Scope:**
  - Initialized Next.js `16.4.6` (App Router, Turbopack, `cacheComponents: true`) with strict TypeScript, ESLint, Prettier (`prettier-plugin-tailwindcss`), and `node --test` checks.
  - Configured Tailwind CSS v4, `shadcn/ui` (Radix `nova` preset), `lucide-react`, `Outfit`/`Work Sans`/`JetBrains Mono` fonts, and official Elevante design tokens (`#17264F`, `#245B70`, `#319C78`, `#F5F6F2`, `#FFFFFF`, primary `100deg` gradient).
  - Organized official logos (`Logo.png`, `Horizontal-E-Logo.png`, `Vertical-E-Logo.png`) into `public/logos/` and `favicon_io/*` into `public/`, updating `public/site.webmanifest`.
  - Established folder structure (`src/app`, `src/components`, `src/lib`, `src/types`, `src/config`, `supabase/migrations`).
  - Configured typed environment validation (`src/config/env.ts`, `.env.example`) and Supabase client helpers (`client.ts`, `server.ts`, `admin.ts` guarded by `server-only`).
  - Implemented centralized `ActionResult<T>` (`src/types/action.ts`, `src/lib/utils/errors.ts`), custom `not-found.tsx`/`error.tsx`/`global-error.tsx`/`loading.tsx`, reusable `BrandLogo`/`EmptyState`/`StatusIllustration`, `/api/health`, and HTTP security headers in `next.config.ts`.
- **Testing & Security Requirements:**
  - `npm run format:check`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` pass cleanly.
  - Verified zero server-only secret names (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) leak into `.next/static/*.js`.

---

## Phase 2 — Brand Identity and Public Website Shell *(Completed)*
- **Prerequisites:** Phase 1 complete.
- **Features & Scope:**
  - Built sticky responsive `Navbar` (desktop navigation + Radix `Sheet` mobile drawer) with official responsive `BrandLogo` and clear CTAs.
  - Built multi-column `Footer` with brand summary, founder attribution, capability overview, contact links, and legal links.
  - Built Landing Page (`src/app/(marketing)/page.tsx`) covering Hero (Motion transitions + lazy-loaded `@react-three/fiber` v9 3D visual with `useSyncExternalStore` WebGL/reduced-motion detection & `HeroFallbackGraphic`), Agency Intro, 9 Capabilities, Technologies stack, 4-stage Process, Why Choose Elevante, Founders (Pranav Lamkhade & Omkar Sable), DB-ready Portfolio & Testimonials empty slots, FAQ Accordion, and CTA band.
  - Implemented Public Pages: `/about`, `/services`, `/services/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/contact` (`ContactForm` with React Hook Form + `@hookform/resolvers/zod` + honeypot + `/api/contact` server validation), `/faq`, `/privacy-policy`, `/terms`.
  - Added foundational SEO (`src/lib/seo/metadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `Organization` and `FAQPage` JSON-LD).
- **Testing & Security Requirements:**
  - `npm run format:check`, `npm test` (`4/4`), `npm run typecheck`, `npm run lint`, and `npm run build` (`16/16` routes) pass cleanly.
  - Live `next start` verified `200` on all 12 public/SEO routes and `/api/contact` server validation (`400` bad / `503` unconfigured DB).

---

## Phase 3 — Database and Backend Foundation *(Completed)*
- **Prerequisites:** Phase 1 complete; Supabase project credentials required in `.env.local` to run live DB queries.
- **Features & Scope:**
  - Authored versioned SQL migrations in `supabase/migrations/`: `202611250001_init_schema.sql` (25 tables, 9 enums, `ELV-`/`QT-` sequences, `updated_at` triggers, `auth.users` -> `profiles` trigger, performance indexes), `202611250002_rls_and_functions.sql` (search-path-hardened RBAC helpers, `prevent_profile_privilege_escalation()` trigger, RLS policies on all 25 tables, `service_role`-scoped `check_rate_limit` RPC), and `202611250003_storage_buckets.sql` (`public-media`, `project-attachments`, `project-deliverables` buckets + `storage.objects` RLS).
  - Created `supabase/config.toml` and `supabase/seed.sql` (permissions, role-permission mappings, founders Pranav Lamkhade & Omkar Sable, 5 service categories, platform settings, initial CMS hero/intro blocks — zero fake reviews).
  - Added typed `Database` schema (`src/types/database.ts`), parameterized Supabase clients (`<Database>`), `normalizeDatabaseError()`, `extractClientIp()`, `enforceRateLimit()`, Resend email service (`src/lib/email/`), `submitPublicEnquiry()` (`src/lib/services/enquiry.service.ts`), and wired `/api/contact` + `/api/health`.
- **Testing & Security Requirements:**
  - Verified all 25 tables enforce `ENABLE ROW LEVEL SECURITY`, `check_rate_limit` revokes `PUBLIC` access, and `migrations.test.ts` + `9/9` unit tests pass.
  - Note: Applying migrations to a live Supabase instance and verifying live RLS isolation awaits `.env.local` credentials / Supabase project linking.

---

## Phase 4 — Authentication and Authorization *(Completed)*
- **Prerequisites:** Phase 3 complete.
- **Features & Scope:**
  - Built Auth UI & flows (`/register`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`) and `/api/auth/callback` supporting PKCE `code` exchange and OTP `token_hash` verification with open-redirect sanitization (`sanitizeRedirectPath`).
  - Implemented Next.js 16 `src/proxy.ts` for SSR cookie refresh, unauthenticated redirects away from `/dashboard/*` and `/admin/*`, optimistic `/admin` role check, and `Cache-Control: private, no-store`.
  - Implemented server-only session & RBAC guards (`src/lib/auth/session.ts`, `src/lib/auth/guards.ts` with `requireAuth`, `requireRole`, `requirePermission`, `requireAuthOrRedirect`, `requireRoleOrRedirect`).
  - Built Server Actions (`src/actions/auth.actions.ts`) with server-side Zod validation, active-account verification, anti-enumeration password reset, profile update (`updateProfileAction`), and sign-out.
  - Built protected `/dashboard`, `/dashboard/settings` (profile & password update), and `/admin` route shells.
- **Testing & Security Requirements:**
  - `12/12` unit tests pass (RBAC hierarchy, open-redirect blocking, password policy validation); live `next start` verified unauthenticated `307` redirects on `/dashboard`, `/dashboard/settings`, and `/admin`.
  - Live Supabase signup/verify/reset tests await `.env.local` keys and migrated Supabase Auth configuration.

---

## Phase 5 — Dynamic Services, Form Builder, and Public CMS Wiring
- **Prerequisites:** Phase 3 & Phase 4 complete.
- **Features & Scope:**
  - Admin Category & Service Management (`/admin/categories`, `/admin/services`): create, edit, publish/unpublish, reorder, soft-delete, deliverables, features, timelines, pricing modes, SEO fields.
  - Dynamic Service-Specific Form Builder (`/admin/services/[id]/form`): add/reorder/edit typed fields (`text`, `textarea`, `number`, `select`, `multiselect`, `radio`, `checkbox`, `date`, `file`, `url`), options, required flags, validation rules.
  - Reusable Dynamic Form Renderer (`<DynamicServiceForm />`) with client UX + server-side dynamic Zod schema validation.
  - Website Content & Media Management foundation (`/admin/content`, `/admin/media`) using `site_sections` and `media_assets` with `revalidateTag` on publish/update.
  - Wire public `/services`, `/services/[slug]`, `/faq`, and landing page service/content sections to live Supabase queries.
- **Testing & Security Requirements:**
  - Verify publishing/unpublishing a service immediately reflects on `/services` (and unpublished services are hidden from public/anon).
  - Verify dynamic Zod validator rejects invalid types, missing required dynamic fields, and unknown fields on server submission.

---

## Phase 6 — Customer Portal
- **Prerequisites:** Phase 4 & Phase 5 complete.
- **Features & Scope:**
  - Customer Dashboard layout & overview (`/dashboard`) with active counts, recent updates, and quick actions.
  - "Start a Project" (`/dashboard/projects/new?service=...`) rendering selected service's dynamic brief form + authenticated private reference file uploads (`project-attachments` bucket).
  - My Projects (`/dashboard/projects`) and Project Details (`/dashboard/projects/[id]`) displaying submitted brief snapshot, current status, timeline, files, quotations, messages, and deliverables.
  - My Files (`/dashboard/files`), Notifications (`/dashboard/notifications`), and Account Settings (`/dashboard/settings`).
- **Testing & Security Requirements:**
  - Verify strict tenant isolation: Customer A cannot access Customer B's `/dashboard/projects/[id]`, files, or signed URLs.
  - Verify file upload type/size validation rejects disallowed MIME types/extensions and oversized files server-side.
  - Verify submitting a project preserves a field snapshot even if an admin edits the service form afterward.

---

## Phase 7 — Admin Dashboard
- **Prerequisites:** Phase 5 & Phase 6 complete.
- **Features & Scope:**
  - Admin Overview (`/admin`) with live operational metrics (open enquiries, active projects, pending quotes, revenue estimates, recent audit events).
  - Customer Management (`/admin/customers`): view profiles, active status, project/enquiry history.
  - Enquiry Management (`/admin/enquiries`): triage public contact submissions, assign, add notes, mark converted.
  - Project & Order Management (`/admin/projects`): filter, search, assign team members, manage status & internal notes.
  - Quotation Management (`/admin/quotations`): create/edit versioned line-item quotations.
  - Portfolio Management (`/admin/portfolio`), Testimonials & FAQ Management, Website Content & Media Management (`/admin/content`, `/admin/media`).
  - Team Management & Role Permissions (`/admin/team`), Analytics & Reports (`/admin/analytics`), Audit Logs (`/admin/audit-logs`), Platform Settings (`/admin/settings`).
  - Wire public `/portfolio` and `/portfolio/[slug]` + landing testimonials/featured work to live DB records.
- **Testing & Security Requirements:**
  - Verify RBAC enforcement per permission (`staff` vs `admin` vs `super_admin`).
  - Verify sensitive admin actions (service changes, role updates, quotation sends, status overrides, content publishing) append immutable records to `audit_logs`.

---

## Phase 8 — End-to-End Project & Quotation Workflow
- **Prerequisites:** Phase 6 & Phase 7 complete.
- **Features & Scope:**
  - Complete the 14-step agency workflow connecting Customer Portal & Admin Dashboard:
    - Admin review & clarification request flow (`clarification_needed`).
    - Quotation dispatch (`draft` -> `sent` + notification + Resend email) and Customer review (`accept`, `request_revision`, `decline`).
    - Admin agreement confirmation & status transitions (`quote_accepted` -> `in_progress` -> `review_ready` -> `completed`) recorded in `project_status_history`.
    - Project-scoped Customer <-> Admin/Staff messaging (`project_messages`, keeping `is_internal_note = true` strictly invisible to customers).
    - Deliverables upload (`project-deliverables` bucket), visibility toggle (`is_customer_accessible`), secure short-lived signed download URLs, and download counter tracking.
    - Payment-ready verification (`payment_records` schema clean and inactive without fake checkout).
- **Testing & Security Requirements:**
  - Integration test walking through all 14 steps from service selection to completion and deliverable download.
  - Verify customers cannot read `is_internal_note = true` messages or `draft` quotations.
  - Verify email + in-app notifications fire safely without crashing transactions if Resend encounters transient errors.

---

## Phase 9 — SEO, Optimization, Accessibility & Security Review
- **Prerequisites:** Phases 2–8 functionally complete.
- **Features & Scope:**
  - Dynamic `sitemap.ts` & `robots.ts`.
  - Complete Schema.org JSON-LD (`Organization`, `Person`, `Service`, `CreativeWork`, `FAQPage`, `BreadcrumbList`).
  - AEO & GEO content clarity review across Home, About, Services, Portfolio, and FAQ (no fabricated info).
  - Performance tuning: Core Web Vitals, bundle inspection, image optimization, Three.js/Motion dynamic loading verification, query/index review.
  - Full security audit (`security-audit` skill workflow): trust boundaries, RLS verification, CSP & HTTP headers, rate limiting, file upload edge cases, auth session handling.
  - Responsive & WCAG AA accessibility audit across all public, customer, and admin screens.
- **Testing & Security Requirements:**
  - Lighthouse / Core Web Vitals checks on public routes.
  - Zero critical/high security findings; clean CSP/headers verification.

---

## Phase 10 — Testing and Deployment
- **Prerequisites:** Phase 9 complete.
- **Features & Scope:**
  - Unit tests (Zod validators, dynamic form schema builder, pricing/quotation totals, permission helpers).
  - Integration tests (Server Actions, RLS policy assertions, file signer authorization).
  - End-to-End (E2E) test suite (Playwright: public browse, registration/login, project brief submission, admin quote send, customer quote accept, deliverable download).
  - Production environment setup: Vercel project env vars, Supabase production migrations & custom SMTP (Resend), domain DNS, error monitoring setup, and external go-live credentials/inputs handover checklist.
  - Production Readiness Checklist & final verification (`npm run lint`, `tsc --noEmit`, `npm test`, `npm run build`).
- **Completion Criteria:** All automated tests and production build pass; deployment checklist verified without skipped assertions.

---

## Recommended Exact Next Task (Phase 7 Start)

When **Phase 7 — Admin Dashboard** is approved:
1. Build Admin Overview (`/admin`) live operational metrics (open enquiries, active projects, pending quotes, audit events) and Enquiry triage (`/admin/enquiries`) + Customer directory (`/admin/customers`).
2. Build Admin Project Management (`/admin/projects`), Line-Item Quotation Builder (`/admin/quotations`), and Portfolio & Testimonial Management (`/admin/portfolio`) wiring public `/portfolio`, `/portfolio/[slug]`, and landing work/testimonials to live DB records.
3. Build Admin Team & Role Permissions (`/admin/team`), Audit Logs (`/admin/audit-logs`), Analytics (`/admin/analytics`), and Platform Settings (`/admin/settings`).

