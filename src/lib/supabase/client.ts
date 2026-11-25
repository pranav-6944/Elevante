import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseEnv } from "@/config/env";

export function createClient() {
  const { url, anonKey } = requirePublicSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
