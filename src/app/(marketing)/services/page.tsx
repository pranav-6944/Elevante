import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAPABILITIES } from "@/lib/content/public-defaults";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { CapabilitiesGrid } from "@/components/marketing/CapabilitiesGrid";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "Explore ELEVANTE digital services: web development, 3D web experiences, full-stack apps, data analytics, Excel/CSV automation, AI solutions, and branding.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-6 py-14 sm:py-20">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeader
          eyebrow="Service Catalog"
          title="Capabilities Built Around Your Business Goals"
          description="Each ELEVANTE service pairs tailored requirement intake with a clear quotation and milestone delivery workflow."
        />
        <Button asChild className="bg-brand-gradient shrink-0 text-white hover:opacity-95">
          <Link href="/contact" className="inline-flex items-center gap-2">
            <span>Request Custom Scope</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <EmptyState
        title="Dynamic Database Service Catalog Activates in Phase 3 & Phase 5"
        description="Per ELEVANTE's architecture, live service packages, timelines, pricing ranges, and dynamic requirement forms are managed in PostgreSQL rather than hardcoded. Core agency capabilities are summarized below."
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
    </div>
  );
}
