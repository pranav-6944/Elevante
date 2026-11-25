import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminTeamAndRolesData } from "@/lib/services/admin.service";
import { TeamManagerClient } from "@/components/admin/TeamManagerClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Team & Roles",
  description: "Manage agency team roster and RBAC roles.",
  path: "/admin/team",
  noIndex: true,
});

async function TeamAdminContent() {
  const actor = await requirePermissionOrRedirect("team.manage", { nextPath: "/admin/team" });
  const data = await getAdminTeamAndRolesData();

  return (
    <TeamManagerClient
      actorId={actor.id}
      actorRole={actor.role}
      teamMembers={data.teamMembers}
      users={data.users}
      roles={data.roles}
      permissions={data.permissions}
      rolePermissions={data.rolePermissions}
    />
  );
}

export default function AdminTeamPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <TeamAdminContent />
    </Suspense>
  );
}

