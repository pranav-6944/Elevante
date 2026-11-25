import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAPABILITIES } from "@/lib/content/public-defaults";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPublishedCategories, getPublishedServices } from "@/lib/services/catalog.service";
import { EmptyState } from "@/components/common/EmptyState";
import { CapabilitiesGrid } from "@/components/marketing/CapabilitiesGrid";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ServiceCatalogExplorer } from "@/components/services/ServiceCatalogExplorer";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "Explore ELEVANTE digital services: web development, 3D web experiences, full-stack apps, data analytics, Excel/CSV automation, AI solutions, and branding.",
  path: "/services",
});

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    getPublishedCategories(),
    getPublishedServices(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-6 py-14 sm:py-20">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow="Service Catalog"
          title="Capabilities Built Around Your Business Goals"
          description="Browse published services, inspect deliverables and timelines, and submit tailored project requirements."
        />
        <Button asChild className="bg-brand-gradient shrink-0 text-white hover:opacity-95">
          <Link href="/contact" className="inline-flex items-center gap-2">
            <span>Request Custom Scope</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {services.length > 0 ? (
        <ServiceCatalogExplorer categories={categories} services={services} />
      ) : (
        <>
          <EmptyState
            title="No Published Catalog Services Yet"
            description="Once Supabase keys are configured and services are published in the Admin Dashboard, customers can search, filter, and submit custom briefs directly from this catalog."
            action={
              <Button asChild variant="outline">
                <Link href="/contact">Submit a Project Enquiry Now</Link>
              </Button>
            }
          />
          <section className="space-y-6">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Core Agency Disciplines
            </h2>
            <CapabilitiesGrid items={CAPABILITIES} />
          </section>
        </>
      )}
    </div>
  );
}
