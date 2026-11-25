import Link from "next/link";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Project Case Study",
  description: "Individual portfolio project details on ELEVANTE.",
  path: "/portfolio",
  noIndex: true,
});

async function PortfolioDetailBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-16">
      <p className="text-secondary font-mono text-xs tracking-widest uppercase">
        Portfolio Slug: {slug}
      </p>
      <EmptyState
        title="Portfolio Record Awaits CMS Database (Phase 3 & Phase 7)"
        description="Individual case study details, technology stacks, and media galleries will load dynamically from Supabase PostgreSQL."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-brand-gradient text-white">
              <Link href="/contact">Start a Similar Project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/portfolio">Back to Portfolio</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}

export default function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-6 py-16 text-sm">Loading...</div>}>
      <PortfolioDetailBody params={params} />
    </Suspense>
  );
}
