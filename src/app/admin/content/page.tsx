import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getAdminFaqs,
  getAdminServices,
  getAdminSiteSections,
} from "@/lib/services/catalog.service";
import { CmsManagerClient } from "@/components/admin/CmsManagerClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Content & FAQs",
  description: "Manage ELEVANTE website sections and FAQs.",
  path: "/admin/content",
  noIndex: true,
});

async function CmsContent() {
  await requirePermissionOrRedirect("cms.manage", { nextPath: "/admin/content" });
  const [sections, faqs, services] = await Promise.all([
    getAdminSiteSections(),
    getAdminFaqs(),
    getAdminServices(),
  ]);

  return <CmsManagerClient sections={sections} faqs={faqs} services={services} />;
}

export default function AdminContentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <CmsContent />
    </Suspense>
  );
}
