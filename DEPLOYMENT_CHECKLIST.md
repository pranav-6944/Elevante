# ELEVANTE — Pre-Launch Preview & Go-Live Deployment Checklist

Use this runbook to preview **ELEVANTE** locally first, then configure the required external credentials and services before going live on production hosting (Vercel + Supabase + Resend).

---

## 1. Local Preview Before Going Live ("See It First")

Run either command from the project root (`c:\Users\prana_b2roblq\Downloads\Main Projects\Elevante`):

### Option A — Production Build Preview (Matches Live Deployment Headers & Caching)
```bash
npm run build
npm run start
```
Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B — Fast Development Preview
```bash
npm run dev
```
Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

### What Works Immediately Without `.env.local`
- All public pages using curated CMS defaults: `/`, `/services`, `/services/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/about`, `/faq`, `/contact`, `/privacy-policy`, `/terms`
- Responsive desktop/mobile UI, Tailwind v4 styling, Motion animations, Three.js interactive hero scene (with SVG/reduced-motion fallback), dynamic service form preview, and `/login`, `/register`, `/forgot-password` validation screens
- SEO metadata, `/robots.txt`, `/sitemap.xml`, security headers (`CSP`, `X-Frame-Options`, `nosniff`, `COOP`), and `/api/health` (`supabaseConfigured: false`, `databaseConfigured: false`)

### What Activates Once Supabase & Resend Keys Are Added
- User signup, email verification, password reset, login sessions (`/dashboard` & `/admin`)
- Submitting project briefs (`/dashboard/projects/new`) and uploading attachments (`25 MB`)
- Admin CRM, quotations, deliverables (`100 MB`), CMS/service/team/settings persistence, and audit logs
- Transactional emails via Resend and Postgres-backed rate limiting

---

## 2. External Credentials & Details Required From Pranav Before Live Production

Complete these items before setting production hosting live:

### A. Production Domain & Hosting (Vercel)
1. **Final Domain URL:** Confirm your live production domain (e.g., `https://elevante.in`).
2. **`NEXT_PUBLIC_SITE_URL`:** Set to your exact `https://` origin (used for canonical metadata, Schema.org JSON-LD, `sitemap.xml`, `robots.txt`, and email deep links).
3. **DNS Records:** Point apex (`@`) and `www` DNS records at your Vercel project.
4. **Environment Variables (Vercel -> Project Settings -> Environment Variables):** Add all 7 variables from [`.env.example`](./.env.example) across Production (and Preview as needed). Never expose server-only keys with `NEXT_PUBLIC_`.

### B. Supabase Production Project
Create a production Supabase project and collect:
- `NEXT_PUBLIC_SUPABASE_URL` (public project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon/publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` (**server-only secret** — keep strictly server-side)

Then inside **Supabase Dashboard**:
1. **Run SQL Migrations & Seed in Order** (via SQL Editor or `supabase db push`):
   1. `supabase/migrations/202611250001_init_schema.sql`
   2. `supabase/migrations/202611250002_rls_and_functions.sql`
   3. `supabase/migrations/202611250003_storage_buckets.sql`
   4. `supabase/seed.sql`
2. **Verify Auth URL Configuration** (**Authentication -> URL Configuration**):
   - **Site URL:** `https://<your-domain>`
   - **Additional Redirect URLs:** `https://<your-domain>/api/auth/callback` (and keep `http://localhost:3000/api/auth/callback` if developing locally)
3. **Verify Storage Buckets** (**Storage -> Buckets**):
   - `public-media` (Public read, `50 MiB` limit)
   - `project-attachments` (Private, signed URLs, `25 MiB` limit)
   - `project-deliverables` (Private, signed URLs, `100 MiB` limit)

### C. Initial `super_admin` Account Bootstrap
1. Register your primary admin account via `/register` (or create the user in Supabase Auth) and confirm email verification.
2. Promote that user to `super_admin` in the **Supabase SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET role_id = (SELECT id FROM public.roles WHERE slug = 'super_admin')
   WHERE email = '<your-founder-email>';
   ```
3. Verify login redirects you to `/admin`.

### D. Transactional Email (Resend + Domain DNS + Supabase Custom SMTP)
1. **Resend Account & Domain:** Verify your sending domain in Resend (add SPF, DKIM, and DMARC DNS records at your domain registrar).
2. **Server Environment Keys:**
   - `RESEND_API_KEY` (**server-only secret**)
   - `RESEND_FROM_EMAIL` (e.g., `Elevante <hello@elevante.in>` matching your verified Resend domain)
   - `CONTACT_NOTIFICATION_EMAIL` (inbox receiving new contact enquiries and customer quotation/message alerts)
3. **Supabase Custom SMTP:** In **Supabase -> Project Settings -> Authentication -> SMTP Settings**, configure Resend SMTP (`smtp.resend.com`, port `465` or `587`, username `resend`, password `<RESEND_API_KEY>`) so signup, confirmation, and password-reset emails originate reliably from your verified domain without Supabase's default rate limits.

### E. Agency Business Profile, Team & Legal Content (Editable in `/admin`)
Once logged in as `super_admin`:
1. **Agency Contact & Currency Details (`/admin/settings` & `/admin/content`):** Set official agency support email, business phone number, location/address, and preferred quotation currency (`INR` / `USD`).
2. **Founders & Team (`/admin/team` & `/admin/media`):** Upload real portraits and confirm final biographies for **Pranav Lamkhade** (Founder) and **Omkar Sable** (Co-Founder).
3. **Portfolio Case Studies (`/admin/portfolio`):** Replace or update seeded case studies with verified client projects before marketing launch.
4. **Legal Policies:** Review `/privacy-policy` and `/terms` with your final agency contact/jurisdiction wording.

### F. Error Monitoring & Observability
- `src/lib/observability/error-monitor.ts` emits structured JSON error events to server `stderr`, which Vercel Runtime Logs capture automatically. Attach a Vercel Log Drain or external alerting tool (e.g., Sentry) later if proactive Slack/email alerts are required.

---

## 3. Final Pre-Launch Smoke Checks

1. **Automated Verification Gate (Zero Failures / Skips):**
   ```bash
   npm run format:check
   npm test
   npm run typecheck
   npm run lint
   npm run build
   ```
2. **Health Endpoint Check (`GET /api/health`):** Confirm HTTP `200`, `Cache-Control: no-store`, `ok: true`, `supabaseConfigured: true`, `databaseConfigured: true`, `databaseReachable: true`.
3. **Auth & Isolation Check:** Verify unauthenticated `/dashboard` and `/admin` redirect (`307`) to `/login`, and unauthenticated `POST /api/projects`, `POST /api/admin/media`, and `GET /api/projects/files/.../download` return `401`.
4. **End-to-End Agency Flow Smoke Test:**
   - Submit public `/contact` enquiry -> confirm saved in `/admin/enquiries` and Resend notification email arrives.
   - Sign up as test customer -> submit brief on `/dashboard/projects/new` with an attachment -> verify customer cannot open `/admin`.
   - As Admin, open `/admin/projects/[id]`, build & send a quotation -> confirm customer email notification.
   - As Customer, accept quotation on `/dashboard/projects/[id]` -> as Admin, release deliverable -> as Customer, download deliverable and confirm `download_count` increments and `audit_logs` records events.

