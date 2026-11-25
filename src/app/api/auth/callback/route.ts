import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/config/env";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = sanitizeRedirectPath(searchParams.get("next"), "/dashboard");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", origin));
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", origin));
  }

  if (tokenHash && type && ALLOWED_OTP_TYPES.includes(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    return NextResponse.redirect(new URL("/login?error=verification_failed", origin));
  }

  return NextResponse.redirect(new URL("/login?error=invalid_auth_link", origin));
}

