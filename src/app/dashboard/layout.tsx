import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, Shield } from "lucide-react";
import { signOutAction } from "@/actions/auth.actions";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { isAdminPanelRole } from "@/lib/auth/rbac";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardShell({ children }: { children: ReactNode }) {
  const profile = await requireAuthOrRedirect("/dashboard");

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-card/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="inline-flex items-center">
              <BrandLogo variant="horizontal" className="h-8 w-auto" priority />
            </Link>
            <nav
              aria-label="Customer Portal Navigation"
              className="hidden items-center gap-2 sm:flex"
            >
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard" className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  <span>Overview</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5">
                  <Settings className="size-4" aria-hidden="true" />
                  <span>Settings</span>
                </Link>
              </Button>
              {isAdminPanelRole(profile.role) ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin" className="inline-flex items-center gap-1.5">
                    <Shield className="size-4" aria-hidden="true" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
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
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
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
