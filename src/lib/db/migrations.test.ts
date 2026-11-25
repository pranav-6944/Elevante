import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

test("SQL migrations exist, enable RLS on all public tables, and include Storage policies", () => {
  const schemaSql = fs.readFileSync(
    path.join(MIGRATIONS_DIR, "202611250001_init_schema.sql"),
    "utf8"
  );
  const rlsSql = fs.readFileSync(
    path.join(MIGRATIONS_DIR, "202611250002_rls_and_functions.sql"),
    "utf8"
  );
  const storageSql = fs.readFileSync(
    path.join(MIGRATIONS_DIR, "202611250003_storage_buckets.sql"),
    "utf8"
  );

  const tableMatches = [...schemaSql.matchAll(/CREATE TABLE public\.([a-z0-9_]+)/g)].map(
    (m) => m[1]
  );
  assert.ok(tableMatches.length >= 25, `Expected >=25 tables, found ${tableMatches.length}`);

  for (const table of tableMatches) {
    assert.ok(
      rlsSql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
      `Missing RLS enablement for public.${table}`
    );
  }

  assert.ok(rlsSql.includes("REVOKE ALL ON FUNCTION public.check_rate_limit"));
  assert.ok(storageSql.includes("'public-media'"));
  assert.ok(storageSql.includes("'project-attachments'"));
  assert.ok(storageSql.includes("'project-deliverables'"));
});

