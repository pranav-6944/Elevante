import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  getAdminMediaAssets,
  getAdminPortfolioProjects,
  getAdminServices,
  getAdminTestimonials,
} from "@/lib/services/catalog.service";
import { PortfolioManagerClient } from "@/components/admin/PortfolioManagerClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Portfolio",
  description: "Manage published case studies and verified client testimonials.",
  path: "/admin/portfolio",
  noIndex: true,
});

async function PortfolioAdminContent() {
  await requirePermissionOrRedirect("portfolio.manage", { nextPath: "/admin/portfolio" });
  const [projects, testimonials, services, mediaAssets] = await Promise.all([
    getAdminPortfolioProjects(),
    getAdminTestimonials(),
    getAdminServices(),
    getAdminMediaAssets(),
  ]);

  return (
    <PortfolioManagerClient
      projects={projects}
      testimonials={testimonials}
      services={services}
      mediaAssets={mediaAssets}
    />
  );
}

export default function AdminPortfolioPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <PortfolioAdminContent />
    </Suspense>
  );
}
