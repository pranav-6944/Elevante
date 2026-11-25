import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/actions/auth.actions";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES, isAdminRole } from "@/lib/auth/rbac";
import { BrandLogo } from "@/components/common/BrandLogo";
import { RouteVelocityNav, type RouteNavItem } from "@/components/layout/RouteVelocityNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_NAV: readonly (RouteNavItem & { adminOnly: boolean })[] = [
  { label: "Overview", href: "/admin", iconName: "layout-dashboard", adminOnly: false },
  { label: "Enquiries", href: "/admin/enquiries", iconName: "inbox", adminOnly: true },
  { label: "Projects", href: "/admin/projects", iconName: "folder-kanban", adminOnly: false },
  { label: "Quotations", href: "/admin/quotations", iconName: "receipt", adminOnly: true },
  { label: "Customers", href: "/admin/customers", iconName: "users", adminOnly: true },
  { label: "Categories", href: "/admin/categories", iconName: "folder-tree", adminOnly: true },
  { label: "Services", href: "/admin/services", iconName: "layers", adminOnly: true },
  { label: "Portfolio", href: "/admin/portfolio", iconName: "briefcase", adminOnly: true },
  { label: "Content & FAQs", href: "/admin/content", iconName: "file-text", adminOnly: true },
  { label: "Media", href: "/admin/media", iconName: "image", adminOnly: true },
  { label: "Team & Roles", href: "/admin/team", iconName: "users-round", adminOnly: true },
  { label: "Analytics", href: "/admin/analytics", iconName: "bar-chart-3", adminOnly: false },
  { label: "Audit Logs", href: "/admin/audit-logs", iconName: "history", adminOnly: true },
  { label: "Settings", href: "/admin/settings", iconName: "settings", adminOnly: true },
];

async function AdminAuthShell({ children }: { children: ReactNode }) {
  const profile = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin",
    unauthorizedRedirect: "/dashboard",
  });

  const fullAdmin = isAdminRole(profile.role);
  const visibleNav = ADMIN_NAV.filter((item) => !item.adminOnly || fullAdmin);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <header className="bg-brand-navy sticky top-0 z-40 border-b text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1"
            >
              <BrandLogo variant="horizontal" className="h-6 w-auto" priority />
            </Link>
            <Badge className="bg-brand-green text-white">Admin</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/dashboard">Client View</Link>
            </Button>
            <span className="hidden items-center gap-1.5 text-xs text-white/85 sm:inline-flex">
              <ShieldCheck className="text-brand-green size-4" aria-hidden="true" />
              {profile.fullName} ({profile.role})
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
        <RouteVelocityNav
          items={visibleNav}
          rootHref="/admin"
          ariaLabel="Admin Navigation"
          tone="dark"
        />
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminAuthShell>{children}</AdminAuthShell>
    </Suspense>
  );
}
