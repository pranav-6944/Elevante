import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSupabaseEnv } from "@/config/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireAdminSupabaseEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
