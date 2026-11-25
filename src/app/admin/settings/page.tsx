import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminPlatformSettings } from "@/lib/services/admin.service";
import { SettingsManagerClient } from "@/components/admin/SettingsManagerClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Platform Settings",
  description: "Super Admin governance settings.",
  path: "/admin/settings",
  noIndex: true,
});

async function SettingsContent() {
  const actor = await requirePermissionOrRedirect("settings.manage", {
    nextPath: "/admin/settings",
  });
  const settings = await getAdminPlatformSettings();
  return <SettingsManagerClient actorRole={actor.role} settings={settings} />;
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <SettingsContent />
    </Suspense>
  );
}

