"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPublicEnv, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { getDefaultHomeForRole } from "@/lib/auth/rbac";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
} from "@/lib/validations/auth";
import type { ActionResult } from "@/types";

function ensureAuthConfigured(): ActionResult<never> | null {
  if (!isSupabaseConfigured()) {
    return fail(
      "CONFIGURATION_ERROR",
      "Authentication requires Supabase environment keys (.env.local) to be configured."
    );
  }
  return null;
}

export async function registerAction(
  rawInput: RegisterInput
): Promise<ActionResult<{ email: string; requiresEmailVerification: boolean }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = registerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          company_name: parsed.data.companyName || null,
        },
      },
    });

    if (error) {
      return fail("VALIDATION_ERROR", error.message);
    }

    return ok({
      email: parsed.data.email,
      requiresEmailVerification: !data.session,
    });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function loginAction(
  rawInput: LoginInput,
  requestedNext?: string | null
): Promise<ActionResult<{ redirectTo: string }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      return fail("UNAUTHORIZED", "Invalid email or password.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, role_id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return fail("FORBIDDEN", "This account has been deactivated. Contact support.");
    }

    let role: "customer" | "staff" | "admin" | "super_admin" = "customer";
    if (profile?.role_id) {
      const { data: roleRow } = await supabase
        .from("roles")
        .select("slug")
        .eq("id", profile.role_id)
        .maybeSingle();
      if (roleRow?.slug) {
        role = roleRow.slug;
      }
    }

    const defaultHome = getDefaultHomeForRole(role);
    const safeNext = requestedNext ? sanitizeRedirectPath(requestedNext, defaultHome) : defaultHome;
    const redirectTo =
      safeNext.startsWith("/admin") && role === "customer" ? "/dashboard" : safeNext;

    return ok({ redirectTo });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function forgotPasswordAction(
  rawInput: ForgotPasswordInput
): Promise<ActionResult<{ submitted: true }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
    const supabase = await createClient();

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/reset-password`,
    });

    // Always return generic success to prevent account email enumeration.
    return ok({ submitted: true });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function resetPasswordAction(
  rawInput: ResetPasswordInput
): Promise<ActionResult<{ updated: true }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = resetPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return fail(
        "UNAUTHORIZED",
        "Your recovery session has expired. Please request a new password reset link."
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return fail("VALIDATION_ERROR", error.message);
    }

    return ok({ updated: true });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function resendVerificationAction(
  email: string
): Promise<ActionResult<{ sent: true }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
    const supabase = await createClient();
    await supabase.auth.resend({
      type: "signup",
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/dashboard`,
      },
    });
    return ok({ sent: true });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function updateProfileAction(
  rawInput: UpdateProfileInput
): Promise<ActionResult<{ updated: true }>> {
  const unconfigured = ensureAuthConfigured();
  if (unconfigured) return unconfigured;

  const parsed = updateProfileSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: normalizeActionError(parsed.error) };
  }

  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        company_name: parsed.data.companyName || null,
        job_title: parsed.data.jobTitle || null,
      })
      .eq("id", user.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return ok({ updated: true });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
