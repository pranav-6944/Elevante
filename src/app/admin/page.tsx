import { Suspense } from "react";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES } from "@/lib/auth/rbac";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "ELEVANTE protected administrative operations workspace.",
  path: "/admin",
  noIndex: true,
});

async function AdminOverviewContent() {
  const profile = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin",
    unauthorizedRedirect: "/dashboard",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Role-Protected Operations
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            ELEVANTE Admin Workspace
          </h1>
        </div>
        <Badge variant="secondary" className="capitalize">
          Verified Role: {profile.role}
        </Badge>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">RBAC Guard Active</CardTitle>
          <CardDescription>
            Access to `/admin` is verified server-side via `requireRoleOrRedirect()` and PostgreSQL
            Row Level Security. Customer accounts are blocked automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Signed in as <strong className="text-foreground">{profile.fullName}</strong> (
          {profile.email}).
        </CardContent>
      </Card>

      <EmptyState
        title="Service Builder & Full Admin Modules Launch in Phases 5 & 7"
        description="Dynamic service catalog management, form builder, customer CRM, quotations, portfolio CMS, media library, and audit logs will be added in Phases 5 and 7."
      />
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
