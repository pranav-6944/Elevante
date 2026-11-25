import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, requirePublicSupabaseEnv } from "@/config/env";
import { getDefaultHomeForRole, isAdminPanelRole } from "@/lib/auth/rbac";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const GUEST_ONLY_AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isGuestAuthRoute = GUEST_ONLY_AUTH_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isSupabaseConfigured()) {
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = requirePublicSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname.startsWith("/admin") || isGuestAuthRoute)) {
    const { data: roleSlug } = await supabase.rpc("current_user_role");
    const role = (roleSlug ?? "customer") as "customer" | "staff" | "admin" | "super_admin";

    if (pathname.startsWith("/admin") && !isAdminPanelRole(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isGuestAuthRoute) {
      return NextResponse.redirect(new URL(getDefaultHomeForRole(role), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
