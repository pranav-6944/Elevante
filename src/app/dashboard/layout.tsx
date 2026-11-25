import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { signOutAction } from "@/actions/auth.actions";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { isAdminPanelRole } from "@/lib/auth/rbac";
import { getUnreadNotificationCount } from "@/lib/services/portal.service";
import { BrandLogo } from "@/components/common/BrandLogo";
import { RouteVelocityNav, type RouteNavItem } from "@/components/layout/RouteVelocityNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PORTAL_NAV_BASE: readonly RouteNavItem[] = [
  { label: "Overview", href: "/dashboard", iconName: "layout-dashboard" },
  { label: "Start Project", href: "/dashboard/projects/new", iconName: "plus-circle" },
  { label: "My Projects", href: "/dashboard/projects", iconName: "folder-kanban" },
  { label: "My Files", href: "/dashboard/files", iconName: "file-archive" },
  { label: "Notifications", href: "/dashboard/notifications", iconName: "bell" },
  { label: "Settings", href: "/dashboard/settings", iconName: "settings" },
];

async function DashboardShell({ children }: { children: ReactNode }) {
  const profile = await requireAuthOrRedirect("/dashboard");
  const unreadCount = await getUnreadNotificationCount(profile.id);
  const portalNav: RouteNavItem[] = PORTAL_NAV_BASE.map((item) =>
    item.href === "/dashboard/notifications" ? { ...item, badgeCount: unreadCount } : item
  );

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <header className="bg-card/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center">
              <BrandLogo variant="horizontal" className="h-8 w-auto" priority />
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Client Portal
            </Badge>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAdminPanelRole(profile.role) ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin" className="inline-flex items-center gap-1.5">
                  <Shield className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              </Button>
            ) : null}
            <div className="hidden text-right text-xs md:block">
              <p className="text-foreground font-semibold">{profile.fullName}</p>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {profile.roleName}
            </Badge>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>

        <RouteVelocityNav
          items={portalNav}
          rootHref="/dashboard"
          ariaLabel="Customer Portal Navigation"
          tone="light"
        />
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
