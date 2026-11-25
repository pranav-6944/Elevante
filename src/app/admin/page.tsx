import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  FileText,
  FolderKanban,
  FolderTree,
  History,
  Image as ImageIcon,
  Inbox,
  Layers,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES, isAdminRole } from "@/lib/auth/rbac";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminOverviewMetrics } from "@/lib/services/admin.service";
import { formatMoneyMinor, formatShortDate } from "@/lib/utils/format";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "ELEVANTE protected administrative operations workspace.",
  path: "/admin",
  noIndex: true,
});

const ADMIN_MODULES = [
  {
    title: "Enquiries",
    description: "Triage contact leads, assign leads, and log notes.",
    href: "/admin/enquiries",
    icon: Inbox,
    adminOnly: true,
  },
  {
    title: "Project Requests",
    description: "Review briefs, assign leads, and progress project status.",
    href: "/admin/projects",
    icon: FolderKanban,
    adminOnly: false,
  },
  {
    title: "Quotations",
    description: "Create versioned line-item proposals and dispatch quotes.",
    href: "/admin/quotations",
    icon: Receipt,
    adminOnly: true,
  },
  {
    title: "Customers",
    description: "Inspect registered client profiles and project counts.",
    href: "/admin/customers",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Categories & Services",
    description: "Manage taxonomy, pricing modes, and custom brief forms.",
    href: "/admin/services",
    icon: Layers,
    adminOnly: true,
  },
  {
    title: "Portfolio & Case Studies",
    description: "Publish verified client case studies to /portfolio.",
    href: "/admin/portfolio",
    icon: Briefcase,
    adminOnly: true,
  },
  {
    title: "Content, FAQs & Testimonials",
    description: "Manage site sections, FAQs, and verified testimonials.",
    href: "/admin/content",
    icon: FileText,
    adminOnly: true,
  },
  {
    title: "Media Library",
    description: "Upload images, videos, and documents into public Storage.",
    href: "/admin/media",
    icon: ImageIcon,
    adminOnly: true,
  },
  {
    title: "Team & RBAC Roles",
    description: "Manage founders/team showcase and RBAC role assignments.",
    href: "/admin/team",
    icon: UsersRound,
    adminOnly: true,
  },
  {
    title: "Analytics",
    description: "Review service demand, status breakdown, and quote pipeline.",
    href: "/admin/analytics",
    icon: BarChart3,
    adminOnly: false,
  },
  {
    title: "Audit Logs",
    description: "Inspect immutable security and operational event logs.",
    href: "/admin/audit-logs",
    icon: History,
    adminOnly: true,
  },
  {
    title: "Platform Settings",
    description: "Super Admin governance for agency profile and defaults.",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
  },
];

async function AdminOverviewContent() {
  const profile = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin",
    unauthorizedRedirect: "/dashboard",
  });

  const fullAdmin = isAdminRole(profile.role);
  const metrics = await getAdminOverviewMetrics(profile);
  const modules = ADMIN_MODULES.filter((m) => !m.adminOnly || fullAdmin);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Role-Protected Operations
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            ELEVANTE Operations Hub
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Role: {profile.role}</Badge>
          <Link
            href="/admin/categories"
            className="text-secondary inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <FolderTree className="size-3.5" aria-hidden="true" />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Projects</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeProjectsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            In intake, quotation, or delivery
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Quotations</CardDescription>
            <CardTitle className="text-3xl">{metrics.pendingQuotesCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Sent or viewed by clients
          </CardContent>
        </Card>

        {fullAdmin ? (
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Open Enquiries</CardDescription>
              <CardTitle className="text-3xl">{metrics.openEnquiriesCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              New or contacted leads
            </CardContent>
          </Card>
        ) : null}

        {fullAdmin ? (
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Registered Customers</CardDescription>
              <CardTitle className="text-3xl">{metrics.totalCustomersCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs">
              {metrics.pipelineByCurrency.length > 0
                ? metrics.pipelineByCurrency
                    .map((p) => formatMoneyMinor(p.totalMinor, p.currency))
                    .filter(Boolean)
                    .join(" · ")
                : "Portal client accounts"}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Latest incoming client requests.</CardDescription>
            </div>
            <Link
              href="/admin/projects"
              className="text-secondary text-xs font-medium hover:underline"
            >
              All Projects
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {metrics.recentProjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No submitted projects yet.</p>
            ) : (
              metrics.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/projects/${p.id}`}
                  className="bg-background hover:border-secondary flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-secondary font-mono text-xs font-semibold">
                      {p.project_code}
                    </p>
                    <p className="text-foreground truncate font-medium">{p.title}</p>
                    <p className="text-muted-foreground text-xs">{p.customerName}</p>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {fullAdmin ? (
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Audit Activity</CardTitle>
                <CardDescription>Latest recorded system mutations.</CardDescription>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-secondary text-xs font-medium hover:underline"
              >
                Full Log
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {metrics.recentAuditLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No audit events logged yet.</p>
              ) : (
                metrics.recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-background flex items-center justify-between gap-3 rounded-xl border p-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="text-foreground font-mono font-semibold">{log.action}</p>
                      <p className="text-muted-foreground truncate">
                        {log.actor_email ?? "system"} · {log.entity_type}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {formatShortDate(log.created_at)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-foreground text-xl font-bold tracking-tight">Operations Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.href} href={mod.href} className="group">
                <Card className="bg-card hover:border-secondary h-full transition-all hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="bg-accent text-primary flex size-9 items-center justify-center rounded-xl">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <ArrowRight
                      className="text-muted-foreground group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <CardTitle className="text-base">{mod.title}</CardTitle>
                    <CardDescription className="text-xs">{mod.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminOverviewContent />
    </Suspense>
  );
}
