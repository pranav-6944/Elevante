import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminEnquiriesData } from "@/lib/services/admin.service";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Enquiries",
  description: "Triage and manage ELEVANTE contact enquiries.",
  path: "/admin/enquiries",
  noIndex: true,
});

async function EnquiriesContent() {
  await requirePermissionOrRedirect("enquiries.manage", { nextPath: "/admin/enquiries" });
  const { enquiries, staffOptions } = await getAdminEnquiriesData();
  return <EnquiriesManager enquiries={enquiries} staffOptions={staffOptions} />;
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <EnquiriesContent />
    </Suspense>
  );
}
