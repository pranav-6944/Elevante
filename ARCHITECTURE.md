# ELEVANTE — System Architecture

> **Primary Reference:** [ProjectBrief.md](./ProjectBrief.md)  
> **Companion Docs:** [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)

---

## 1. Overall System Architecture

ELEVANTE follows a **server-first modular monolith** architecture built on **Next.js (App Router)** deployed to **Vercel**, backed by **Supabase** (PostgreSQL, Auth, Storage) and **Resend** for transactional email. No external microservices or separate API servers are introduced, keeping operational complexity minimal while supporting horizontal stateless scaling across Next.js serverless/edge functions and PostgreSQL connection pooling.

```text
+-----------------------------------------------------------------------------------+
|                                   CLIENTS (Browser)                               |
|   Public Visitors         Authenticated Customers          Admin / Agency Team    |
+------------+------------------------+-------------------------------+-------------+
             |                        |                               |
             v                        v                               v
+-----------------------------------------------------------------------------------+
|                        NEXT.JS APP ROUTER (Vercel Runtime)                        |
|                                                                                   |
|  1. Middleware (src/middleware.ts)                                                |
|     - Refreshes Supabase SSR auth cookies                                         |
|     - Redirects unauthenticated users away from /dashboard & /admin               |
|     - Applies baseline security headers                                           |
|                                                                                   |
|  2. Rendering & Route Groups                                                      |
|     - (marketing)/  -> SSR / ISR public pages, SEO metadata, JSON-LD, sitemap     |
|     - (auth)/       -> Login, Register, Verify, Forgot/Reset Password             |
|     - dashboard/    -> Protected Customer Portal (tenant-scoped)                  |
|     - admin/        -> Protected Admin CRM/CMS (RBAC-guarded)                     |
|                                                                                   |
|  3. Server Logic Layer                                                            |
|     - Server Actions (src/actions/*) -> Form mutations, CRM/CMS ops, workflow     |
|     - Route Handlers (src/app/api/*) -> Auth callback, public contact, uploads,   |
|                                         file download signers, health check       |
|     - Domain Services (src/lib/services/*) -> Business rules, Zod validation      |
+------------+----------------------------------------+-----------------------------+
             |                                        |
             | HTTPS / Supabase SDK                   | HTTPS / REST
             v                                        v
+----------------------------------------+  +---------------------------------------+
|           SUPABASE PLATFORM            |  |             RESEND EMAIL              |
|                                        |  |                                       |
|  - Supabase Auth (JWT + SSR Cookies)   |  |  - Transactional notifications        |
|  - Supabase PostgreSQL + RLS Policies  |  |  - Custom SMTP for Auth emails (Prod) |
|  - Supabase Storage (3 Segmented       |  +---------------------------------------+
|    Buckets with Signed URL Access)     |
+----------------------------------------+
```

---

## 2. Frontend Structure

### Route Organization (`src/app/`)
- **`src/app/(marketing)/`**
  - `/` — Landing page (Hero, Intro, Services/Categories preview, Featured Portfolio, Capabilities/Tech, How It Works, Why Elevante, Founders, Testimonials, FAQ, Contact CTA)
  - `/about` — Agency story, vision, founders (Pranav Lamkhade & Omkar Sable), team showcase
  - `/services` — Searchable, category-filterable public catalog
  - `/services/[slug]` — Individual service details, deliverables, timeline, pricing mode, FAQ, Start Project CTA
  - `/portfolio` — Filterable case studies & work showcase
  - `/portfolio/[slug]` — Individual portfolio case study details
  - `/contact` — General enquiry form + agency contact info
  - `/faq` — Categorized FAQs with JSON-LD `FAQPage` structured data
  - `/privacy-policy` & `/terms` — Legal pages (CMS-backed or structured legal content)
- **`src/app/(auth)/`**
  - `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
  - `/auth/callback` (Route Handler for Supabase PKCE code exchange & verification redirects)
- **`src/app/dashboard/`** *(Customer Portal)*
  - `/dashboard` — Overview stats (active requests, pending quotes, unread notifications/messages)
  - `/dashboard/projects/new` — Select service & complete dynamic service-specific brief + upload reference files
  - `/dashboard/projects` — Project list with status filters & search
  - `/dashboard/projects/[id]` — Unified workspace: timeline/status history, submitted brief snapshot, quotations, messages, reference files, deliverables
  - `/dashboard/quotations` — All quotations across projects
  - `/dashboard/messages` — Project conversation threads
  - `/dashboard/files` — Customer reference uploads & completed deliverables
  - `/dashboard/notifications` — Notification center
  - `/dashboard/settings` — Profile & password management
- **`src/app/admin/`** *(Admin Dashboard)*
  - `/admin` — Operational KPIs & recent activity
  - `/admin/customers` — Customer directory & project/enquiry history
  - `/admin/enquiries` — Public contact leads & conversion workflow
  - `/admin/services` & `/admin/categories` — Catalog & Dynamic Form Builder
  - `/admin/projects` & `/admin/projects/[id]` — Order workflow, status transitions, internal notes, deliverables, messages
  - `/admin/quotations` — Quotation builder (line items, versioning, send/track)
  - `/admin/portfolio`, `/admin/content` (sections, testimonials, FAQs, SEO), `/admin/media`
  - `/admin/team` — Team showcase & RBAC role/permission assignments
  - `/admin/analytics`, `/admin/notifications`, `/admin/audit-logs`, `/admin/settings`

### Component Organization (`src/components/`)
- `ui/` — `shadcn/ui` primitives (Button, Input, Dialog, Sheet, Table, Badge, Skeleton, Toast, etc.)
- `layout/` — Navbar (responsive drawer), Footer, Customer Sidebar/Topbar, Admin Sidebar/Topbar, Brand Logo (`Logo.png`, `Horizontal-E-Logo.png`, `Vertical-E-Logo.png`)
- `marketing/` — Hero, Service Explorer, Portfolio Grid, Founders Showcase, Process Steps, Testimonials, FAQ Accordion, Contact Form, Safe SVG Empty/Error Illustrations
- `services/` — Dynamic Brief Form Renderer (`react-hook-form` + dynamically built Zod resolver from `service_form_fields`)
- `dashboard/` — Customer Project Timeline, Quotation Review Panel, Thread Composer, File Uploader/Downloader
- `admin/` — Dynamic Form Builder, Quotation Line-Item Editor, CMS Section Editor, Media Picker, Audit Log Viewer

### Server vs Client Component Boundaries
- **Server Components by default** for all layouts, public marketing pages, detail pages, tables, and initial data fetching.
- **Client Components (`'use client'`)** strictly scoped to interactive widgets: forms, search/filter bars, dropdowns, modals, Motion wrappers, and dynamically imported Three.js/R3F scenes (`next/dynamic` with `{ ssr: false }`).

---

## 3. Backend Structure

Business logic lives cleanly in `src/lib/` rather than inside JSX components:

```text
src/
├── actions/                  # Next.js Server Actions (thin auth + Zod parse + delegate to domain services)
│   ├── auth.actions.ts
│   ├── enquiry.actions.ts
│   ├── service.actions.ts
│   ├── project.actions.ts
│   ├── quotation.actions.ts
│   ├── message.actions.ts
│   ├── deliverable.actions.ts
│   ├── cms.actions.ts
│   └── admin.actions.ts
├── app/api/                  # Route Handlers (non-form HTTP endpoints)
│   ├── auth/callback/route.ts
│   ├── health/route.ts
│   ├── contact/route.ts      # Optional rate-limited JSON endpoint or handled via action + rate limit
│   └── files/
│       ├── upload-url/route.ts
│       └── download-url/route.ts
└── lib/
    ├── supabase/
    │   ├── client.ts         # Browser anon client (client components only)
    │   ├── server.ts         # Cookie-aware SSR/Server Action client
    │   └── admin.ts          # Service-role client (server-only; guarded import)
    ├── auth/
    │   ├── session.ts        # getCurrentUser(), getCurrentProfile()
    │   └── guards.ts         # requireUser(), requireRole(), requirePermission()
    ├── validations/          # Zod schemas + dynamic form schema generator
    ├── services/             # Domain logic (projects, quotations, cms, notifications, audit)
    ├── email/                # Resend client & typed email templates
    ├── security/             # Rate limiter, file validation, CSP/header helpers, sanitization
    └── utils/                # Error normalization, pagination, formatting, currency
```

### Server Actions vs Route Handlers Split
- **Use Server Actions** for authenticated UI mutations (profile update, project submission, form builder saves, quotation creation/acceptance, message posting, CMS edits, status updates) with progressive `ActionResult<T>` responses and `revalidatePath` / `revalidateTag`.
- **Use Route Handlers** for:
  - OAuth / email verification PKCE callback (`/api/auth/callback`)
  - Signed Storage upload/download URL generation (`/api/files/upload-url`, `/api/files/download-url`) where explicit HTTP status codes (`401`, `403`, `413`, `429`) and streaming/headers are beneficial
  - Health checks (`/api/health`) and future payment webhook endpoints (`/api/webhooks/payments` — reserved for post-initial release)

---

## 4. Authentication & Authorization Architecture

### Authentication Flow (`Supabase Auth` + `@supabase/ssr`)
1. Users register via email/password; Supabase Auth sends a verification email redirecting to `/api/auth/callback?next=/dashboard`.
2. PKCE `code` exchange sets HTTP-only auth cookies via `@supabase/ssr`.
3. Every `profiles` row is created automatically via a PostgreSQL `AFTER INSERT ON auth.users` trigger (assigning default `customer` role), preventing orphaned auth users without profiles.
4. Forgot Password triggers `resetPasswordForEmail` pointing to `/api/auth/callback?next=/reset-password`.
5. `src/middleware.ts` refreshes tokens transparently on every request and enforces fast pre-route redirects for `/dashboard/*` and `/admin/*`.

### Defense-in-Depth Authorization (RBAC)
Never trust middleware or client UI state alone. Every protected Server Component, Server Action, and Route Handler verifies identity and authorization **on the server** using `supabase.auth.getUser()` (never `getSession()` alone, as `getUser()` revalidates JWT integrity with Supabase Auth):

| Role | Intended Users | Capabilities |
| :--- | :--- | :--- |
| **`customer`** | Clients | Manage own profile, create project requests, upload own reference files, view/respond to own quotations, message on own projects, download own deliverables |
| **`staff`** | Agency specialists / designers / devs | Access assigned projects, respond to customer messages, upload deliverables, view reference files for assigned projects |
| **`admin`** | Agency managers / founders | Full operational access: enquiries, customers, services, form builder, all projects, quotations, portfolio, CMS, media, notifications |
| **`super_admin`** | Founders (Pranav / Omkar) | All `admin` rights + team role/permission assignment, audit log oversight, platform settings, soft-delete/archive actions |

Every mutation also enforces **PostgreSQL Row Level Security (RLS)** so even a bug in application query filtering cannot leak another customer's records.

---

## 5. Database & Storage Architecture

### PostgreSQL
- Central source of truth (`DATABASE_DESIGN.md`).
- All migrations tracked sequentially in `supabase/migrations/`.
- Sensitive operations write immutable entries into `audit_logs`.
- Status transitions record immutable entries in `project_status_history` and trigger in-app `notifications` (+ Resend email where configured).

### Supabase Storage Buckets & File Security
1. **`public-media` (Public Read / Admin Write)**
   - Portfolio screenshots, service thumbnails, testimonials avatars, CMS images/videos.
   - Served via Next.js `<Image>` / optimized CDN URLs.
2. **`project-attachments` (Private / Signed URLs Only)**
   - Customer reference files & project thread attachments.
   - Upload authorized via server endpoint after checking user auth, project ownership (or staff assignment), MIME allowlist, extension allowlist, and size cap (e.g., max 25 MB per file).
   - Stored under deterministic non-guessable paths: `{project_id}/{uploader_id}/{uuid}-{sanitized_filename}`.
3. **`project-deliverables` (Private / Signed URLs Only)**
   - Final agency deliverables uploaded by authorized `staff`/`admin`.
   - Customer downloads require server-verified ownership + `is_customer_accessible = true`, returning short-lived signed URLs (e.g., 60–300 seconds) and incrementing `download_count` / audit trail.

---

## 6. Validation, Error Handling & Security Strategy

### Validation
- **Client UX:** React Hook Form + Zod resolver for immediate inline errors.
- **Server Enforcement:** Every Server Action and Route Handler re-validates inputs with Zod. For dynamic service briefs (`service_form_fields`), the server fetches the active field definitions from PostgreSQL, dynamically builds a strict Zod schema, validates every submitted answer, and rejects unknown or malformed keys.

### Centralized Error Handling
- Standard discriminated response type for Server Actions:
  ```ts
  type ActionResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };
  ```
- Global `src/app/not-found.tsx` (custom 404), `src/app/error.tsx` (route segment boundary), and `src/app/global-error.tsx` (root 500 fallback) featuring Elevante's safe custom SVG illustrations.
- Database/Supabase errors mapped centrally via `normalizeSupabaseError()` so internal table names, SQL states, or stack traces are never leaked to end users, while structured server logs capture full diagnostics.

### Security Controls
- **Rate Limiting:** Persistent Supabase RPC/table-backed (or optional Redis) rate limiter on public endpoints (`/contact`, auth triggers, signed URL generation) keyed by IP + action.
- **Security Headers (`next.config.ts`):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security`, and a staged `Content-Security-Policy` allowing Supabase, Vercel, and Three.js assets safely.
- **No Secret Leakage:** `server-only` package/guards on `src/lib/supabase/admin.ts` and `src/lib/email/resend.ts`.
- **Safe SVG / 3D Rendering:** Pure inline/static SVGs without unescaped user HTML (`dangerouslySetInnerHTML` avoided except sanitized structured JSON-LD with `<` escaping).

---

## 7. SEO, AEO, and GEO Architecture

- **Public SSR/ISR:** Marketing pages render HTML on the server with tag-based revalidation (`revalidateTag('services')`, `revalidateTag('portfolio')`, `revalidateTag('cms')`, `revalidateTag('faqs')`) triggered automatically when admins save changes.
- **Metadata & Crawlability:**
  - Dynamic `generateMetadata()` per page/service/portfolio item with canonical URLs and Open Graph / Twitter cards.
  - App Router `src/app/sitemap.ts` (dynamically pulling published services & portfolio slugs) and `src/app/robots.ts` (disallowing `/dashboard/`, `/admin/`, `/api/`, `/auth/`).
- **Structured Data (Schema.org JSON-LD):**
  - `Organization` + `Person` (Pranav Lamkhade, Omkar Sable) on Home/About.
  - `Service` + `BreadcrumbList` on `/services/[slug]`.
  - `CreativeWork` on `/portfolio/[slug]`.
  - `FAQPage` on `/faq` and service FAQ sections.
- **AEO & GEO Integrity:** Clear Q&A phrasing, factual service scopes/deliverables/timelines, consistent organization entity attributes across pages, and zero fake reviews or keyword stuffing.

---

## 8. Deployment & Environments Architecture

- **Environments:**
  - **Local Development:** Next.js dev server + local or dedicated dev Supabase project + `.env.local` (gitignored).
  - **Staging / Preview (Vercel Previews):** Connected to dev/staging Supabase project to test PRs safely.
  - **Production (Vercel Main):** Connected to production Supabase project, custom domain, Vercel Analytics/Speed Insights, Error Monitoring (e.g., Sentry or structured log drain), and Resend domain-verified SMTP + transactional emails.
- **Migration Discipline:** Schema updates flow exclusively via `supabase/migrations/*.sql` reviewed in PRs before running against staging/production.

