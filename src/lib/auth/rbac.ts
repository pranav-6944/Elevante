import type { UserRole } from "@/types";

export const ADMIN_PANEL_ROLES: readonly UserRole[] = ["staff", "admin", "super_admin"];
export const FULL_ADMIN_ROLES: readonly UserRole[] = ["admin", "super_admin"];

export function isAdminPanelRole(role: UserRole | null | undefined): boolean {
  return Boolean(role && ADMIN_PANEL_ROLES.includes(role));
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return Boolean(role && FULL_ADMIN_ROLES.includes(role));
}

export function isSuperAdminRole(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function hasAllowedRole(
  role: UserRole | null | undefined,
  allowedRoles: readonly UserRole[]
): boolean {
  return Boolean(role && allowedRoles.includes(role));
}

export function getDefaultHomeForRole(role: UserRole | null | undefined): string {
  return isAdminPanelRole(role) ? "/admin" : "/dashboard";
}
