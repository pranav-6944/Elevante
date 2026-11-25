import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/errors";
import type { UserRole } from "@/types";
import { hasAllowedRole } from "./rbac";
import { sanitizeRedirectPath } from "./redirects";
import { getCurrentAuthProfile, type AuthProfile } from "./session";

export async function requireAuth(): Promise<AuthProfile> {
  const profile = await getCurrentAuthProfile();
  if (!profile) {
    throw new AppError("UNAUTHORIZED", "Authentication is required.", 401);
  }
  if (!profile.isActive) {
    throw new AppError("FORBIDDEN", "Your account has been deactivated.", 403);
  }
  return profile;
}

export async function requireRole(allowedRoles: readonly UserRole[]): Promise<AuthProfile> {
  const profile = await requireAuth();
  if (!hasAllowedRole(profile.role, allowedRoles)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  }
  return profile;
}

export async function requirePermission(permissionCode: string): Promise<AuthProfile> {
  const profile = await requireAuth();
  if (profile.role === "super_admin") {
    return profile;
  }

  const supabase = await createClient();
  const { data: allowed, error } = await supabase.rpc("user_has_permission", {
    perm_code: permissionCode,
  });

  if (error || !allowed) {
    throw new AppError("FORBIDDEN", "Insufficient permissions for this operation.", 403);
  }

  return profile;
}

export async function requireAuthOrRedirect(nextPath = "/dashboard"): Promise<AuthProfile> {
  const profile = await getCurrentAuthProfile();
  if (!profile || !profile.isActive) {
    const safeNext = sanitizeRedirectPath(nextPath, "/dashboard");
    redirect(`/login?next=${encodeURIComponent(safeNext)}`);
  }
  return profile;
}

export async function requireRoleOrRedirect(
  allowedRoles: readonly UserRole[],
  options?: { nextPath?: string; unauthorizedRedirect?: string }
): Promise<AuthProfile> {
  const profile = await requireAuthOrRedirect(options?.nextPath ?? "/admin");
  if (!hasAllowedRole(profile.role, allowedRoles)) {
    redirect(options?.unauthorizedRedirect ?? "/dashboard");
  }
  return profile;
}

