# AI_NOTES.md — Elevante Project Memory & Quick Index

> Maintained per project rules for rapid, accurate future context without unnecessary repo re-scans.

---

## 1. Environment & Repository Snapshot (Verified 2026-11-25)
- **Root Path:** `c:\Users\prana_b2roblq\Downloads\Main Projects\Elevante`
- **Toolchain:** Node `v22.18.0`, npm `10.9.3`, Git `2.49.0.windows.1`
- **Git State:** Fresh local repository initialized (`git init -b main`); old dirty history removed; no remote linked yet. Preserved files:
  - `ProjectBrief.md`
  - `Logo.png` (`818×613`)
  - `Horizontal-E-Logo.png` (`2110×527`)
  - `Vertical-E-Logo.png` (`1296×929`)
  - `favicon_io/` (`android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon.ico`, `site.webmanifest`)
- **Action Reminder for Phase 1:** Preserve `ProjectBrief.md`, Phase 0 docs, logos, and `favicon_io/` when initializing Next.js, move brand assets into `public/`, and attach new GitHub remote when provided.

---

## 2. `ProjectBrief.md` Key Reference Map (405 Lines)
- **Lines 1–8:** Agency intro, founders (**Pranav Lamkhade**, **Omkar Sable**), 9 core service domains, production scale goal.
- **Lines 10–26:** Tech stack (Next.js App Router, React, TS, Tailwind, shadcn/ui, Motion for React, Three.js/R3F selective, Server Actions + Route Handlers, Supabase PG/Auth/Storage, Zod + RHF, Resend, Lucide + custom SVG, Vercel, Git/GitHub).
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
- **Lines 381–405:** Strict development prohibitions (no hardcoded mock services/auth/payments).

---

## 3. Core Architectural Keywords & Conventions
- **Action Result Pattern:** `ActionResult<T>` discriminated union (`ok: true | false`).
- **Storage Buckets:** `public-media` (public), `project-attachments` (private signed URL), `project-deliverables` (private signed URL).
- **RBAC Roles:** `customer`, `staff`, `admin`, `super_admin` + `permissions` / `role_permissions`.
- **Snapshot Rule:** `project_requests.form_schema_snapshot` + `project_form_responses` preserve submitted labels/types independently of future `service_form_fields` edits.
- **Internal Notes Security:** `project_messages.is_internal_note = true` must always be filtered out by RLS for customers.
- **Skills to Apply in Upcoming Phases:**
  - `ponytail` (coding/debugging/refactoring simplicity)
  - `ui-ux-pro-max` (design system & UI/UX polish in Phases 1–2+)
  - `security-audit` (Phase 3/4/8/9 security verification)
  - `context7` (up-to-date Next.js, Supabase, shadcn/ui, RHF, Zod, Motion, R3F docs)

