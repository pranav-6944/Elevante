import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSupabaseEnv } from "@/config/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireAdminSupabaseEnv();
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
