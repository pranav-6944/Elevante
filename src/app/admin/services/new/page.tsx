import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminCategories, getAdminMediaAssets } from "@/lib/services/catalog.service";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "New Service",
  description: "Create a new ELEVANTE service.",
  path: "/admin/services/new",
  noIndex: true,
});

async function NewServiceContent() {
  await requirePermissionOrRedirect("services.manage", { nextPath: "/admin/services/new" });
  const [categories, mediaAssets] = await Promise.all([
    getAdminCategories(),
    getAdminMediaAssets(),
  ]);
  return <ServiceEditor categories={categories} mediaAssets={mediaAssets} />;
}

export default function NewServicePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <NewServiceContent />
    </Suspense>
  );
}
