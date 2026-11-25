# ELEVANTE — Digital Solutions Agency Platform

Full-stack digital solutions agency website, dynamic service brief builder, isolated customer portal, and role-based operations dashboard built with Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Motion, Three.js / React Three Fiber, Supabase, Zod, and Resend.

## Quick Local Preview (Before Deployment)

1. Install dependencies (if needed):
   ```bash
   npm install
   ```
2. Preview locally:
   - **Development mode:** `npm run dev`
   - **Production preview (recommended before go-live):**
     ```bash
     npm run build
     npm run start
     ```
3. Open [http://localhost:3000](http://localhost:3000).

> Public marketing pages, responsive 3D/Motion UI, service catalogs, form validation, and SEO routes work immediately out of the box with curated defaults. To enable authentication, database persistence, file uploads, and email alerts, copy [`.env.example`](./.env.example) to `.env.local` and follow [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md).

## Scripts

- `npm run dev` — Run local Next.js dev server
- `npm run build` — Build production bundle
- `npm run start` — Serve production build locally
- `npm test` — Run unit and production-readiness tests (`node --test --experimental-strip-types`)
- `npm run typecheck` — Generate Next types and run `tsc --noEmit`
- `npm run lint` — Run ESLint
- `npm run format:check` — Verify Prettier formatting

## Project Documentation

- [`ProjectBrief.md`](./ProjectBrief.md) — Product vision and specification
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System architecture and security boundaries
- [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) — PostgreSQL schema, RLS, and Storage layout
- [`IMPLEMENTATION_ROADMAP.md`](./IMPLEMENTATION_ROADMAP.md) — Completed phases (0–10)
- [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) — Pre-launch verification and production credentials checklist
