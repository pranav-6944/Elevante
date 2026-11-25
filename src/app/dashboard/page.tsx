import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, FileArchive, FolderKanban, Plus } from "lucide-react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCustomerDashboardData } from "@/lib/services/portal.service";
import { formatShortDate } from "@/lib/utils/format";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Customer Portal",
  description: "Track project requests, reference files, quotations, and deliverables.",
  path: "/dashboard",
  noIndex: true,
});

async function DashboardOverviewContent() {
  const profile = await requireAuthOrRedirect("/dashboard");
  const overview = await getCustomerDashboardData(profile.id);

  const statCards = [
    {
      label: "Active Projects",
      value: overview.activeProjects,
      sub: `${overview.totalProjects} total submitted`,
      icon: FolderKanban,
    },
    {
      label: "Awaiting Quote Action",
      value: overview.quotedProjects,
      sub: "Ready for your review",
      icon: ArrowRight,
    },
    {
      label: "Completed",
      value: overview.completedProjects,
      sub: "Delivered engagements",
      icon: CheckCircle2,
    },
    {
      label: "Unread Updates",
      value: overview.unreadNotifications,
      sub: "Portal notifications",
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Client Workspace
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Welcome back, {profile.fullName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {profile.companyName
              ? `${profile.companyName} · Manage your project briefs, files, quotations, and deliverables.`
              : "Manage your project briefs, reference files, quotations, and deliverables."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline">
            <Link href="/services">Browse Services</Link>
          </Button>
          <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
            <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5">
              <Plus className="size-4" aria-hidden="true" />
              <span>Start a Project</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-medium">{stat.label}</CardDescription>
                <Icon className="text-secondary size-4" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <CardDescription>Your latest submitted project briefs and statuses.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/projects">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview.recentProjects.length === 0 ? (
              <EmptyState
                title="No project requests yet"
                description="Choose an ELEVANTE capability and submit a structured brief with reference files to start your first project."
                action={
                  <Button asChild className="bg-brand-gradient text-white">
                    <Link href="/dashboard/projects/new">Start Your First Project</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {overview.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="bg-background hover:border-secondary/60 flex flex-col justify-between gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-secondary font-mono text-xs font-semibold">
                          {project.project_code}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {project.serviceTitle}
                        </span>
                      </div>
                      <p className="text-foreground truncate font-semibold">{project.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <ProjectStatusBadge status={project.status} />
                      <span className="text-muted-foreground text-xs">
                        {formatShortDate(project.submitted_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Recent Updates</CardTitle>
                <CardDescription>Latest activity on your account.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/notifications">All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {overview.recentNotifications.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No notifications yet. Activity updates will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.recentNotifications.map((item) => (
                    <div key={item.id} className="bg-background rounded-xl border p-3.5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground font-medium">{item.title}</p>
                        {!item.is_read ? (
                          <Badge className="bg-brand-green shrink-0 text-[10px] text-white">
                            New
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {item.body}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatShortDate(item.created_at)}
                        </span>
                        {item.link_url ? (
                          <Link
                            href={item.link_url}
                            className="text-secondary font-medium hover:underline"
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5 text-sm">
              <Link
                href="/dashboard/projects/new"
                className="bg-background hover:border-secondary flex items-center justify-between rounded-xl border p-3 font-medium transition-colors"
              >
                <span>Submit New Project Brief</span>
                <Plus className="text-secondary size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/files"
                className="bg-background hover:border-secondary flex items-center justify-between rounded-xl border p-3 font-medium transition-colors"
              >
                <span>Access My Files & Deliverables</span>
                <FileArchive className="text-secondary size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="bg-background hover:border-secondary flex items-center justify-between rounded-xl border p-3 font-medium transition-colors"
              >
                <span>Profile & Account Security</span>
                <ArrowRight className="text-secondary size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <DashboardOverviewContent />
    </Suspense>
  );
}
