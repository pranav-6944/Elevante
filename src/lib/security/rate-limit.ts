import "server-only";
import { isAdminSupabaseConfigured } from "@/config/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, normalizeDatabaseError } from "@/lib/utils/errors";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

export async function enforceRateLimit({
  key,
  maxRequests,
  windowSeconds,
}: {
  key: string;
  maxRequests: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  if (!isAdminSupabaseConfigured()) {
    throw new AppError(
      "CONFIGURATION_ERROR",
      "Rate limiting requires Supabase server configuration.",
      503
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw normalizeDatabaseError(error, "Unable to verify request rate limit.");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new AppError("INTERNAL_ERROR", "Rate limit check returned empty response.", 500);
  }

  if (!row.allowed) {
    throw new AppError(
      "RATE_LIMITED",
      "Too many requests. Please wait a few minutes and try again.",
      429
    );
  }

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    resetAt: row.reset_at,
  };
}
