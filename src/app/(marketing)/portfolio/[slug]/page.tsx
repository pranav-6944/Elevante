import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { getPublicEnv, isSupabaseConfigured } from "@/config/env";
import { buildBreadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { getPublishedPortfolioBySlug } from "@/lib/services/catalog.service";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublishedPortfolioBySlug(slug);

  if (!detail) {
    return buildMetadata({
      title: "Project Case Study",
      description: "Individual portfolio case study on ELEVANTE.",
      path: `/portfolio/${slug}`,
      noIndex: !isSupabaseConfigured(),
    });
  }

  return buildMetadata({
    title: detail.seoTitle || detail.title,
    description: detail.seoDescription || detail.summary,
    path: `/portfolio/${detail.slug}`,
  });
}

async function PortfolioDetailBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const configured = isSupabaseConfigured();
  const detail = await getPublishedPortfolioBySlug(slug);

  if (!configured) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-16">
        <p className="text-secondary font-mono text-xs tracking-widest uppercase">
          Portfolio Slug: {slug}
        </p>
        <EmptyState
          title="Connect Supabase (.env.local) to Load CMS Case Study"
          description="Individual case study details, technology stacks, and outcomes load dynamically from Supabase PostgreSQL."
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

  if (!detail) {
    notFound();
  }

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: detail.title,
    description: detail.summary,
    url: new URL(`/portfolio/${detail.slug}`, NEXT_PUBLIC_SITE_URL).toString(),
    creator: {
      "@type": "Organization",
      name: "ELEVANTE",
      url: NEXT_PUBLIC_SITE_URL,
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(NEXT_PUBLIC_SITE_URL, [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: detail.title, path: `/portfolio/${detail.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="space-y-4">
        <Link
          href="/portfolio"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Back to Portfolio</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {detail.industry ? <Badge variant="secondary">{detail.industry}</Badge> : null}
          {detail.clientName ? <Badge variant="outline">Client: {detail.clientName}</Badge> : null}
        </div>

        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-5xl">
          {detail.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
          {detail.summary}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild className="bg-brand-gradient text-white">
            <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2">
              <span>Start a Similar Project</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          {detail.liveUrl ? (
            <Button asChild variant="outline">
              <a
                href={detail.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <span>Visit Live Project</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {detail.coverImageUrl ? (
        <div className="bg-card overflow-hidden rounded-3xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.coverImageUrl}
            alt={detail.coverImageAlt ?? detail.title}
            className="max-h-[460px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {detail.challenge ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {detail.challenge}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {detail.solution ? (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Solution & Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {detail.solution}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {detail.outcomes.length > 0 ? (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Measured Outcomes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {detail.outcomes.map((outcome) => (
              <div
                key={outcome}
                className="bg-background flex items-start gap-2.5 rounded-xl border p-3.5 text-sm"
              >
                <CheckCircle2
                  className="text-brand-green mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{outcome}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {detail.techStack.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-foreground text-lg font-semibold">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {detail.techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <PortfolioDetailBody params={params} />
    </Suspense>
  );
}
