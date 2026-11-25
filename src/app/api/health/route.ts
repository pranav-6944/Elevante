import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/config/env";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "elevante",
      supabaseConfigured: isSupabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
