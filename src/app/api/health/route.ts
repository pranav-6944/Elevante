import { NextResponse } from "next/server";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const databaseConfigured = isAdminSupabaseConfigured();
  let databaseReachable: boolean | null = null;

  if (databaseConfigured) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("roles").select("id", { head: true, count: "exact" });
      databaseReachable = !error;
    } catch {
      databaseReachable = false;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      service: "elevante",
      supabaseConfigured,
      databaseConfigured,
      databaseReachable,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
