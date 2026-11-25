import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminCustomers } from "@/lib/services/admin.service";
import { CustomersManager } from "@/components/admin/CustomersManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Customers",
  description: "Manage registered ELEVANTE customer accounts.",
  path: "/admin/customers",
  noIndex: true,
});

async function CustomersContent() {
  await requirePermissionOrRedirect("projects.read_all", { nextPath: "/admin/customers" });
  const customers = await getAdminCustomers();
  return <CustomersManager customers={customers} />;
}

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <CustomersContent />
    </Suspense>
  );
}
