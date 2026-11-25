import assert from "node:assert/strict";
import test from "node:test";
import {
  getPublicEnv,
  getServerEnv,
  isSupabaseConfigured,
  requireAdminSupabaseEnv,
  requirePublicSupabaseEnv,
} from "./env.ts";

test("getPublicEnv defaults NEXT_PUBLIC_SITE_URL cleanly and validates missing Supabase keys", () => {
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const prevService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const pub = getPublicEnv();
    assert.equal(pub.NEXT_PUBLIC_SITE_URL, "http://localhost:3000");
    assert.equal(isSupabaseConfigured(), false);
    assert.throws(() => requirePublicSupabaseEnv(), /NEXT_PUBLIC_SUPABASE_URL/);
    assert.throws(() => requireAdminSupabaseEnv(), /NEXT_PUBLIC_SUPABASE_URL/);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-placeholder";
    assert.equal(isSupabaseConfigured(), true);
    assert.deepEqual(requirePublicSupabaseEnv(), {
      url: "https://example.supabase.co",
      anonKey: "anon-key-placeholder",
    });
    assert.throws(() => requireAdminSupabaseEnv(), /SUPABASE_SERVICE_ROLE_KEY/);

    const serverEnv = getServerEnv();
    assert.equal(serverEnv.SUPABASE_SERVICE_ROLE_KEY, undefined);
  } finally {
    if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;

    if (prevAnon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevAnon;

    if (prevService === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = prevService;
  }
});
