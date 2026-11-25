import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminCategories } from "@/lib/services/catalog.service";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin Categories",
  description: "Manage ELEVANTE service categories.",
  path: "/admin/categories",
  noIndex: true,
});

async function CategoriesContent() {
  await requirePermissionOrRedirect("services.manage", { nextPath: "/admin/categories" });
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Service Categories</h1>
        <p className="text-muted-foreground text-sm">
          Create, publish, and organize categories across the public catalog.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <CategoriesContent />
    </Suspense>
  );
}
