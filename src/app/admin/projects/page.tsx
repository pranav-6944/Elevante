import { Suspense } from "react";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES } from "@/lib/auth/rbac";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminProjects } from "@/lib/services/admin.service";
import { AdminProjectsManager } from "@/components/admin/AdminProjectsManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Projects",
  description: "Inspect and manage customer project requests.",
  path: "/admin/projects",
  noIndex: true,
});

async function AdminProjectsContent() {
  const actor = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin/projects",
    unauthorizedRedirect: "/dashboard",
  });
  const projects = await getAdminProjects(actor);
  return <AdminProjectsManager projects={projects} />;
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminProjectsContent />
    </Suspense>
  );
}
