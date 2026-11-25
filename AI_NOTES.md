# AI_NOTES.md — Elevante Project Memory & Quick Index

> Maintained per project rules for rapid, accurate future context without unnecessary repo re-scans.

---

## 1. Environment & Repository Snapshot (Verified 2026-11-25)
- **Root Path:** `c:\Users\prana_b2roblq\Downloads\Main Projects\Elevante`
- **Toolchain:** Node `v22.18.0`, npm `10.9.3`, Git `2.49.0.windows.1`, Python `3.13.6`
- **Git Remote:** `origin` -> `https://github.com/pranav-6944/Elevante.git` (`main` branch, rebased over initial `LICENSE` commit `81d3c74`)
- **Installed Stack Versions (Phase 1):**
  - `next`: `16.4.6` (App Router, Turbopack, `cacheComponents: true`, `partialPrefetching: true`)
  - `react` / `react-dom`: `19.3.0`
  - `tailwindcss`: `4.3.3` + `@tailwindcss/turbopack` `4.3.3`
  - `shadcn`: `4.23.0` (`radix-nova` preset, `radix-ui` `1.8.1`, `lucide-react` `1.79.0`)
  - `@supabase/ssr`: `0.12.7`, `@supabase/supabase-js`: `2.119.2`
  - `zod`: `4.6.7`, `server-only`: `0.0.1`
  - Phase 2 Packages: `motion` `14.14.0`, `react-hook-form` `7.92.0`, `@hookform/resolvers` `7.0.9`, `three` `0.187.0`, `@react-three/fiber` `9.8.2`
  - Phase 3 Packages: `resend` (latest installed)
- **Preserved Brand Assets & Runtime Paths:**
  - `Logo.png` (`818×613`) -> `/logos/Logo.png`
  - `Horizontal-E-Logo.png` (`2110×527`) -> `/logos/Horizontal-E-Logo.png`
  - `Vertical-E-Logo.png` (`1296×929`) -> `/logos/Vertical-E-Logo.png`
  - `favicon_io/*` -> `public/` (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, updated `site.webmanifest`)

---

## 2. Next.js 16.4.6 Specific Gotchas (`node_modules/next/dist/docs/`)
- **`src/proxy.ts` replaces `src/middleware.ts`:** Export `proxy(request: NextRequest)`. Do not create both files.
- **`error.tsx` & `global-error.tsx`:** Props signature in Next.js 16 docs is `{ error: unknown; retry: () => void }` (not `reset`).
- **`cacheComponents: true` & `partialPrefetching: true`:** Components reading `cookies()`, `headers()`, or dynamic runtime data must sit inside `<Suspense>` (or use `'use cache: private'` / `'use cache'` + `cacheTag()`).
- **`turbopack.root: process.cwd()`:** Explicitly set in `next.config.ts` to prevent Next.js from picking up parent lockfiles outside the repository.
- **`tsconfig.json`:** `"allowImportingTsExtensions": true` enabled alongside `"noEmit": true` so `node --test --experimental-strip-types src/**/*.test.ts` works with zero extra test runner packages.

---

## 3. `ProjectBrief.md` Key Reference Map (405 Lines)
- **Lines 1–8:** Agency intro, founders (**Pranav Lamkhade**, **Omkar Sable**), 9 core service domains, production scale goal.
- **Lines 10–26:** Tech stack (Next.js, Tailwind, shadcn/ui, Motion for React, Three.js/R3F selective, Server Actions/Route Handlers, Supabase PG/Auth/Storage, Zod+RHF, Resend, Lucide+custom SVG, Vercel).
- **Lines 28–43:** Brand colors (`linear-gradient(100deg, #17264F 0%, #245B70 52%, #319C78 100%)`, `#17264F`, `#245B70`, `#319C78`, `#F5F6F2`, `#FFFFFF`).
- **Lines 45–77:** Public website sections & 9 public page types.
- **Lines 79–94:** Dynamic Service Catalog & Service-Specific Form Builder.
- **Lines 95–111:** Customer Accounts & Portal (strict record/file isolation).
- **Lines 112–138:** Admin Dashboard (17 modules, server-side RBAC, CMS editing).
- **Lines 139–161:** 14-step Agency Quotation Workflow; NO fake payments; future payment-ready.
- **Lines 162–194:** Supabase PostgreSQL schema entities & Storage rules.
- **Lines 195–227:** SEO, AEO, GEO requirements (no misleading schema/fake reviews).
- **Lines 228–270:** Security, Reliability, Scalability, Performance rules.
- **Lines 271–379:** Target `src/`, `supabase/`, and `public/` folder architecture.

---

## 4. Key Code Locations (Phases 1–4)
- **Important User Reminder (Phase 10 Go-Live):** Before moving from dev to live production, remind Pranav of all external details & credentials needed (Supabase URL/keys, Resend API key + verified domain DNS/SMTP, production domain URL, initial `super_admin` promotion email, official agency support email/phone/address, Omkar Sable bio/photo, final legal review, Vercel env vars, error monitoring DSN).
- Env & Brand Config: `src/config/env.ts`, `src/config/site.ts`, `.env.example`
- Supabase Clients & Types: `src/lib/supabase/{client.ts,server.ts,admin.ts}`, `src/types/database.ts`
- Migrations & Seed: `supabase/migrations/{202611250001_init_schema.sql,202611250002_rls_and_functions.sql,202611250003_storage_buckets.sql}`, `supabase/seed.sql`, `supabase/config.toml`
- Security, Rate Limit & Email: `src/lib/security/{ip.ts,rate-limit.ts}`, `src/lib/email/{templates.ts,resend.ts}`, `src/lib/services/enquiry.service.ts`
- Auth & RBAC: `src/proxy.ts`, `src/app/api/auth/callback/route.ts`, `src/actions/auth.actions.ts`, `src/lib/auth/{session.ts,guards.ts,rbac.ts,redirects.ts}`, `src/lib/validations/auth.ts`, `src/app/(auth)/`, `src/components/auth/`, `src/app/dashboard/`, `src/app/admin/`
- Error & Action Envelope: `src/types/action.ts`, `src/lib/utils/errors.ts`
- Global Boundaries & APIs: `src/app/{not-found.tsx,error.tsx,global-error.tsx,loading.tsx}`, `src/app/api/{health,contact}/route.ts`
- Brand UI Primitives: `src/components/common/{BrandLogo.tsx,StatusIllustration.tsx,EmptyState.tsx}`
- Public Marketing Shell & Pages: `src/app/(marketing)/`, `src/components/layout/{Navbar.tsx,Footer.tsx}`, `src/components/marketing/`
- Content & SEO: `src/lib/content/public-defaults.ts`, `src/lib/validations/enquiry.ts`, `src/lib/seo/metadata.ts`, `src/app/{sitemap.ts,robots.ts}`
