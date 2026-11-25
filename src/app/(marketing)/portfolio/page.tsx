import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Portfolio",
  description:
    "Explore ELEVANTE digital engineering, 3D web, AI, analytics, and brand design case studies.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-14 sm:py-20">
      <SectionHeader
        eyebrow="Selected Work"
        title="Portfolio & Case Studies"
        description="Real client outcomes, architecture highlights, and visual deliverables managed through our CMS."
      />

      <EmptyState
        title="CMS-Driven Portfolio Launches in Phase 3 & Phase 7"
        description="We only publish authentic case studies managed in the database—never fabricated client demos. Contact us to request capability walkthroughs tailored to your industry."
        action={
          <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
            <Link href="/contact">Request Capability Walkthrough</Link>
          </Button>
        }
      />
    </div>
  );
}
