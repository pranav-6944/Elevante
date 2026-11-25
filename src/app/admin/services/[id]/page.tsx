import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getAdminCategories,
  getAdminMediaAssets,
  getAdminServiceById,
} from "@/lib/services/catalog.service";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Edit Service",
  description: "Edit ELEVANTE service details.",
  path: "/admin/services",
  noIndex: true,
});

async function EditServiceContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermissionOrRedirect("services.manage", { nextPath: `/admin/services/${id}` });
  const [detail, categories, mediaAssets] = await Promise.all([
    getAdminServiceById(id),
    getAdminCategories(),
    getAdminMediaAssets(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <ServiceEditor service={detail.service} categories={categories} mediaAssets={mediaAssets} />
  );
}

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <EditServiceContent params={params} />
    </Suspense>
  );
}
