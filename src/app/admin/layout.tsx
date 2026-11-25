import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import {
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOutAction } from "@/actions/auth.actions";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES } from "@/lib/auth/rbac";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Services", href: "/admin/services", icon: Layers },
  { label: "Content & FAQs", href: "/admin/content", icon: FileText },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
];

async function AdminAuthShell({ children }: { children: ReactNode }) {
  const profile = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin",
    unauthorizedRedirect: "/dashboard",
  });

  return (
    <div className="bg-background flex min-h-screen flex-col">
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
        <nav aria-label="Admin Navigation" className="bg-brand-navy/95 border-t border-white/10">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
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
