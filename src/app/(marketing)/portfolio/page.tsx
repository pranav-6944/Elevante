import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getPublicEnv, isSupabaseConfigured } from "@/config/env";
import { buildBreadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { getPublishedPortfolioProjects } from "@/lib/services/catalog.service";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Portfolio",
  description:
    "Explore ELEVANTE digital engineering, 3D web, AI, analytics, and brand design case studies.",
  path: "/portfolio",
});

async function PortfolioCatalogBody() {
  const configured = isSupabaseConfigured();
  const projects = await getPublishedPortfolioProjects();

  if (!configured || projects.length === 0) {
    return (
      <EmptyState
        title={
          configured
            ? "Verified Case Studies Coming Soon"
            : "Connect Supabase (.env.local) to Load CMS Portfolio"
        }
        description="ELEVANTE only publishes authentic client work managed through the Admin Portfolio CMS—never fabricated demos. Contact us to request capability walkthroughs tailored to your industry."
        action={
          <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
            <Link href="/contact">Request Capability Walkthrough</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="bg-card flex flex-col justify-between overflow-hidden">
          <div>
            {project.coverImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={project.coverImageUrl}
                alt={project.coverImageAlt ?? project.title}
                className="h-48 w-full object-cover"
              />
            ) : null}
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {project.industry ? <Badge variant="secondary">{project.industry}</Badge> : null}
                {project.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
              </div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription>{project.summary}</CardDescription>
            </CardHeader>
          </div>

          <CardContent className="space-y-4 border-t pt-4">
            {project.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-[11px]">
                    {tech}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="inline-flex items-center gap-1.5"
                >
                  <span>Read Case Study</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <span>Live</span>
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ELEVANTE Portfolio",
    url: new URL("/portfolio", NEXT_PUBLIC_SITE_URL).toString(),
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(NEXT_PUBLIC_SITE_URL, [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <SectionHeader
        eyebrow="Selected Work"
        title="Portfolio & Case Studies"
        description="Real client outcomes, architecture highlights, and visual deliverables managed through our CMS."
      />

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
        <PortfolioCatalogBody />
      </Suspense>
    </div>
  );
}
