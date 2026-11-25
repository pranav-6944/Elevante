import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walkFiles(dir: string, extensions: readonly string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

test("environment config keys match .env.example and .gitignore protects secrets", () => {
  const envExample = readProjectFile(".env.example");
  const envTs = readProjectFile("src/config/env.ts");
  const gitignore = readProjectFile(".gitignore");

  const expectedEnvKeys = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "CONTACT_NOTIFICATION_EMAIL",
  ];

  for (const key of expectedEnvKeys) {
    assert.ok(envExample.includes(`${key}=`), `Missing ${key} in .env.example`);
    assert.ok(envTs.includes(key), `Missing ${key} in src/config/env.ts`);
  }

  assert.match(gitignore, /^\.env\*$/m, ".gitignore must exclude .env* files");
  assert.match(gitignore, /^!\.env\.example$/m, ".gitignore must allow !.env.example");
});

test("all public, auth, portal, admin, API, SEO, and boundary routes exist without duplicate root page", () => {
  assert.equal(
    fs.existsSync(path.join(ROOT, "src/app/page.tsx")),
    false,
    "src/app/page.tsx must stay removed so src/app/(marketing)/page.tsx owns / cleanly"
  );

  const requiredRoutes = [
    "src/app/(marketing)/page.tsx",
    "src/app/(marketing)/about/page.tsx",
    "src/app/(marketing)/services/page.tsx",
    "src/app/(marketing)/services/[slug]/page.tsx",
    "src/app/(marketing)/portfolio/page.tsx",
    "src/app/(marketing)/portfolio/[slug]/page.tsx",
    "src/app/(marketing)/faq/page.tsx",
    "src/app/(marketing)/contact/page.tsx",
    "src/app/(marketing)/privacy-policy/page.tsx",
    "src/app/(marketing)/terms/page.tsx",
    "src/app/(auth)/login/page.tsx",
    "src/app/(auth)/register/page.tsx",
    "src/app/(auth)/forgot-password/page.tsx",
    "src/app/(auth)/reset-password/page.tsx",
    "src/app/(auth)/verify-email/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/projects/page.tsx",
    "src/app/dashboard/projects/new/page.tsx",
    "src/app/dashboard/projects/[id]/page.tsx",
    "src/app/dashboard/files/page.tsx",
    "src/app/dashboard/notifications/page.tsx",
    "src/app/dashboard/settings/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin/customers/page.tsx",
    "src/app/admin/enquiries/page.tsx",
    "src/app/admin/projects/page.tsx",
    "src/app/admin/projects/[id]/page.tsx",
    "src/app/admin/quotations/page.tsx",
    "src/app/admin/categories/page.tsx",
    "src/app/admin/services/page.tsx",
    "src/app/admin/services/new/page.tsx",
    "src/app/admin/services/[id]/page.tsx",
    "src/app/admin/services/[id]/form/page.tsx",
    "src/app/admin/portfolio/page.tsx",
    "src/app/admin/content/page.tsx",
    "src/app/admin/media/page.tsx",
    "src/app/admin/team/page.tsx",
    "src/app/admin/analytics/page.tsx",
    "src/app/admin/audit-logs/page.tsx",
    "src/app/admin/settings/page.tsx",
    "src/app/api/health/route.ts",
    "src/app/api/contact/route.ts",
    "src/app/api/auth/callback/route.ts",
    "src/app/api/projects/route.ts",
    "src/app/api/projects/[id]/files/route.ts",
    "src/app/api/projects/files/[fileId]/download/route.ts",
    "src/app/api/admin/media/route.ts",
    "src/app/api/admin/projects/[id]/deliverables/route.ts",
    "src/app/sitemap.ts",
    "src/app/robots.ts",
    "src/app/error.tsx",
    "src/app/global-error.tsx",
    "src/app/not-found.tsx",
  ];

  for (const route of requiredRoutes) {
    assert.equal(fs.existsSync(path.join(ROOT, route)), true, `Missing required route: ${route}`);
  }
});

test("security headers, CSP directives, and deployment documentation are configured", () => {
  const nextConfig = readProjectFile("next.config.ts");

  const requiredConfigTokens = [
    "poweredByHeader: false",
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Cross-Origin-Opener-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    'source: "/api/(.*)"',
    'value: "no-store"',
  ];

  for (const token of requiredConfigTokens) {
    assert.ok(nextConfig.includes(token), `Missing security directive in next.config.ts: ${token}`);
  }

  for (const file of [
    "DEPLOYMENT_CHECKLIST.md",
    "supabase/seed.sql",
    "supabase/config.toml",
    "supabase/migrations/202611250001_init_schema.sql",
    "supabase/migrations/202611250002_rls_and_functions.sql",
    "supabase/migrations/202611250003_storage_buckets.sql",
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), true, `Missing deployment asset: ${file}`);
  }
});

test("client components stay isolated from server-only secrets and source files contain no hardcoded keys", () => {
  const sourceFiles = walkFiles(path.join(ROOT, "src"), [".ts", ".tsx"]);
  const forbiddenInClient = [
    "createAdminClient",
    "requireAdminSupabaseEnv",
    "getServerEnv",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "CONTACT_NOTIFICATION_EMAIL",
  ];
  const secretPatterns = [
    /re_[A-Za-z0-9]{20,}/,
    /eyJhbGci[A-Za-z0-9._-]{20,}/,
    /sk_live_[A-Za-z0-9]{16,}/,
    /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  ];

  for (const filePath of sourceFiles) {
    const rel = path.relative(ROOT, filePath).replaceAll("\\", "/");
    const content = fs.readFileSync(filePath, "utf8");
    const isClient = content.startsWith('"use client"') || content.startsWith("'use client'");

    if (isClient) {
      for (const token of forbiddenInClient) {
        assert.equal(
          content.includes(token),
          false,
          `Client component ${rel} must never reference server-only symbol/key ${token}`
        );
      }
    }

    if (!rel.endsWith(".test.ts")) {
      for (const pattern of secretPatterns) {
        assert.equal(pattern.test(content), false, `Potential hardcoded secret matched in ${rel}`);
      }
    }
  }
});
