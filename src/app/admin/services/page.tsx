import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminCategories, getAdminServices } from "@/lib/services/catalog.service";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin Services",
  description: "Manage ELEVANTE services and pricing modes.",
  path: "/admin/services",
  noIndex: true,
});

async function ServicesContent() {
  await requirePermissionOrRedirect("services.manage", { nextPath: "/admin/services" });
  const [services, categories] = await Promise.all([getAdminServices(), getAdminCategories()]);
  return <ServicesManager services={services} categories={categories} />;
}

export default function AdminServicesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ServicesContent />
    </Suspense>
  );
}
