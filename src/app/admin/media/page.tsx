import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminMediaAssets } from "@/lib/services/catalog.service";
import { MediaManagerClient } from "@/components/admin/MediaManagerClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Media Library",
  description: "Upload and organize public media assets for ELEVANTE.",
  path: "/admin/media",
  noIndex: true,
});

async function MediaContent() {
  await requirePermissionOrRedirect("media.manage", { nextPath: "/admin/media" });
  const assets = await getAdminMediaAssets();
  return <MediaManagerClient assets={assets} />;
}

export default function AdminMediaPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <MediaContent />
    </Suspense>
  );
}
