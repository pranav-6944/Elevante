import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminQuotationsData } from "@/lib/services/admin.service";
import { QuotationsManager } from "@/components/admin/QuotationsManager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Quotations",
  description: "Build and dispatch structured customer quotations.",
  path: "/admin/quotations",
  noIndex: true,
});

async function QuotationsContent({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  await requirePermissionOrRedirect("quotations.manage", { nextPath: "/admin/quotations" });
  const [{ quotations, projects }, { project: initialProjectId }] = await Promise.all([
    getAdminQuotationsData(),
    searchParams,
  ]);

  return (
    <QuotationsManager
      quotations={quotations}
      projects={projects}
      initialProjectId={initialProjectId}
    />
  );
}

export default function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <QuotationsContent searchParams={searchParams} />
    </Suspense>
  );
}
