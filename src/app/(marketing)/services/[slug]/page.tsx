import Link from "next/link";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Service Details",
  description: "Dynamic service details and requirements intake on ELEVANTE.",
  path: "/services",
  noIndex: true,
});

async function ServiceDetailBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-16">
      <p className="text-secondary font-mono text-xs tracking-widest uppercase">
        Service Slug: {slug}
      </p>
      <EmptyState
        title="Service Record Awaits Database Setup (Phase 3 & Phase 5)"
        description="Individual service specifications, deliverables, timelines, and custom project brief forms load directly from Supabase PostgreSQL once Phases 3 and 5 are active."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-brand-gradient text-white">
              <Link href="/contact">Enquire About This Service</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/services">Back to Services</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-6 py-16 text-sm">Loading...</div>}>
      <ServiceDetailBody params={params} />
    </Suspense>
  );
}
