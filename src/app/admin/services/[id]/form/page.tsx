import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminServiceById } from "@/lib/services/catalog.service";
import { FormBuilderClient } from "@/components/admin/FormBuilderClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Dynamic Form Builder",
  description: "Configure custom brief fields for an ELEVANTE service.",
  path: "/admin/services",
  noIndex: true,
});

async function FormBuilderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermissionOrRedirect("forms.manage", { nextPath: `/admin/services/${id}/form` });
  const detail = await getAdminServiceById(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link
          href={`/admin/services/${detail.service.id}`}
          className="inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back to Service Settings</span>
        </Link>
      </Button>
      <FormBuilderClient
        serviceId={detail.service.id}
        serviceTitle={detail.service.title}
        fields={detail.fields}
      />
    </div>
  );
}

export default function AdminServiceFormPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <FormBuilderContent params={params} />
    </Suspense>
  );
}
