import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { getPublicEnv, isSupabaseConfigured } from "@/config/env";
import { buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { formatMoneyMinor, getPublishedServiceBySlug } from "@/lib/services/catalog.service";
import { EmptyState } from "@/components/common/EmptyState";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { DynamicServiceForm } from "@/components/services/DynamicServiceForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublishedServiceBySlug(slug);

  if (!detail) {
    return buildMetadata({
      title: "Service Details",
      description: "Explore ELEVANTE service deliverables, timelines, and project brief intake.",
      path: `/services/${slug}`,
      noIndex: !isSupabaseConfigured(),
    });
  }

  return buildMetadata({
    title: detail.seoTitle || detail.title,
    description: detail.seoDescription || detail.shortDescription,
    path: `/services/${detail.slug}`,
  });
}

async function ServiceDetailBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const configured = isSupabaseConfigured();
  const detail = await getPublishedServiceBySlug(slug);

  if (!configured) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-16">
        <p className="text-secondary font-mono text-xs tracking-widest uppercase">
          Service Slug: {slug}
        </p>
        <EmptyState
          title="Connect Supabase (.env.local) to Load Dynamic Service Details"
          description="Individual service specifications, deliverables, timelines, and custom project brief forms load directly from Supabase PostgreSQL."
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

  if (!detail) {
    notFound();
  }

  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const priceText = formatMoneyMinor(detail.startingPriceMinor, detail.currency);
  const serviceUrl = new URL(`/services/${detail.slug}`, NEXT_PUBLIC_SITE_URL).toString();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: detail.title,
    description: detail.shortDescription,
    serviceType: detail.categoryName,
    url: serviceUrl,
    provider: {
      "@type": "Organization",
      name: "ELEVANTE",
      url: NEXT_PUBLIC_SITE_URL,
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />

      <div className="space-y-5">
        <Link
          href="/services"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>All Services</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{detail.categoryName}</Badge>
          {detail.estimatedTimeline ? (
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {detail.estimatedTimeline}
            </Badge>
          ) : null}
          <Badge variant="outline">
            {detail.pricingMode === "quote_only" || !priceText
              ? "Custom Quotation"
              : detail.pricingMode === "starting_from"
                ? `Starting from ${priceText}`
                : `Estimated ${priceText}`}
          </Badge>
        </div>

        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-5xl">
          {detail.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
          {detail.shortDescription}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild size="lg" className="bg-brand-gradient text-white hover:opacity-95">
            <Link
              href={`/dashboard/projects/new?service=${encodeURIComponent(detail.slug)}`}
              className="inline-flex items-center gap-2"
            >
              <span>Start Project With This Service</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Ask a Question First</Link>
          </Button>
        </div>
      </div>

      {detail.thumbnailUrl ? (
        <div className="bg-card overflow-hidden rounded-3xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.thumbnailUrl}
            alt={detail.thumbnailAlt ?? detail.title}
            className="max-h-96 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Scope &amp; Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {detail.fullDescription}
            </CardContent>
          </Card>

          {detail.deliverables.length > 0 ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Included Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2.5 sm:grid-cols-2">
                {detail.deliverables.map((item) => (
                  <div key={item} className="text-foreground flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className="text-brand-green mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {detail.features.length > 0 ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Capabilities &amp; Highlights</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-sm">
                {detail.features.map((feat) => (
                  <p key={feat} className="flex items-start gap-2">
                    <span className="bg-secondary mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <span>{feat}</span>
                  </p>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="bg-card h-fit">
          <CardHeader>
            <CardTitle>Project Brief Requirements</CardTitle>
            <CardDescription>
              Preview the fields you will complete in the Client Portal when requesting a quote for{" "}
              <strong>{detail.title}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DynamicServiceForm fields={detail.fields} mode="preview" />
            <Button asChild className="bg-brand-gradient w-full text-white">
              <Link href={`/dashboard/projects/new?service=${encodeURIComponent(detail.slug)}`}>
                Proceed to Brief Submission
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {detail.faqs.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Service Questions</h2>
          <FaqAccordion
            items={detail.faqs.map((f) => ({
              id: f.id,
              category: "Services & Delivery",
              question: f.question,
              answer: f.answer,
            }))}
          />
        </section>
      ) : null}
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-6 px-6 py-16">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <ServiceDetailBody params={params} />
    </Suspense>
  );
}
