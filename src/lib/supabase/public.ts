import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseEnv } from "@/config/env";
import type { Database } from "@/types/database";

// Stateless public anon client (no cookies()) safe for Next.js 16 `'use cache'` queries.
export function createPublicDataClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
