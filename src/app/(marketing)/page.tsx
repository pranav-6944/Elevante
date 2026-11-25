import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND } from "@/config/site";
import { getPublicEnv } from "@/config/env";
import {
  AGENCY_CONTACT,
  CAPABILITIES,
  PUBLIC_FAQS,
  TECHNOLOGY_STACK,
  WHY_CHOOSE_ELEVANTE,
  WORKFLOW_STAGES,
} from "@/lib/content/public-defaults";
import { buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { CapabilitiesGrid } from "@/components/marketing/CapabilitiesGrid";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { FoundersSection } from "@/components/marketing/FoundersSection";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/MotionWrapper";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: `${BRAND.name} — Digital Solutions Agency`,
  description: BRAND.description,
  path: "/",
});

export default function HomePage() {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: NEXT_PUBLIC_SITE_URL,
    description: BRAND.description,
    email: AGENCY_CONTACT.email,
    founders: BRAND.founders.map((founder) => ({
      "@type": "Person",
      name: founder.name,
      jobTitle: founder.role,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
      />

      {/* 1. Hero Section */}
      <section className="bg-card/55 relative border-b py-14 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="bg-card text-secondary inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-xs">
              <Sparkles className="text-brand-green size-3.5" aria-hidden="true" />
              <span>Digital Engineering, AI, Analytics &amp; Brand Design</span>
            </div>

            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Digital solutions built for{" "}
              <span className="text-brand-gradient">measurable business elevation.</span>
            </h1>

            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
              ELEVANTE partners with founders and growing organizations to ship production websites,
              interactive 3D web experiences, full-stack applications, data automation, AI
              workflows, and strategic brand design.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="bg-brand-gradient px-6 text-white hover:opacity-95"
              >
                <Link href="/contact" className="inline-flex items-center gap-2">
                  <span>Start a Project</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6">
                <Link href="/services">Explore Capabilities</Link>
              </Button>
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-green size-4" aria-hidden="true" />
                Quotation-first transparency
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="text-secondary size-4" aria-hidden="true" />
                Security-first full-stack architecture
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* 2. Agency Introduction */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="bg-card grid gap-8 rounded-3xl border p-8 shadow-xs md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div className="space-y-4">
              <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
                About ELEVANTE
              </p>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                One integrated agency for product engineering, data intelligence, and brand clarity.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                Instead of splitting strategy across disconnected freelancers, ELEVANTE brings
                full-stack software engineering, automation pipelines, AI integration, and visual
                brand systems together under a single structured delivery workflow.
              </p>
              <div className="pt-1">
                <Button asChild variant="link" className="text-secondary px-0">
                  <Link href="/about" className="inline-flex items-center gap-1.5">
                    <span>Meet the founders &amp; agency philosophy</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 self-center">
              <div className="bg-background rounded-2xl border p-4">
                <p className="font-heading text-foreground text-2xl font-bold">9</p>
                <p className="text-muted-foreground text-xs">Core Digital Disciplines</p>
              </div>
              <div className="bg-background rounded-2xl border p-4">
                <p className="font-heading text-foreground text-2xl font-bold">100%</p>
                <p className="text-muted-foreground text-xs">Custom Scoped Quotations</p>
              </div>
              <div className="bg-background rounded-2xl border p-4">
                <p className="font-heading text-foreground text-2xl font-bold">4-Stage</p>
                <p className="text-muted-foreground text-xs">Transparent Client Workflow</p>
              </div>
              <div className="bg-background rounded-2xl border p-4">
                <p className="font-heading text-foreground text-2xl font-bold">SSR + RLS</p>
                <p className="text-muted-foreground text-xs">Production-Grade Foundation</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. Services & Capabilities */}
      <section className="bg-card/45 border-y py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader
              eyebrow="Capabilities"
              title="Comprehensive Digital Solutions"
              description="From high-converting websites and 3D experiences to Excel/CSV automation, AI systems, and executive brand collateral."
            />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/services">View Service Catalog</Link>
            </Button>
          </div>
          <Reveal>
            <CapabilitiesGrid items={CAPABILITIES} />
          </Reveal>
        </div>
      </section>

      {/* 4. Featured Portfolio Projects (DB-Ready Slot) */}
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Portfolio"
            title="Featured Work & Case Studies"
            description="Verified project case studies are managed dynamically through the ELEVANTE Admin CMS."
          />
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/portfolio">Open Portfolio</Link>
          </Button>
        </div>
        <EmptyState
          title="Portfolio Case Studies Connect in Phase 3 & Phase 7"
          description="ELEVANTE never publishes fabricated demo projects. Live case studies, outcomes, and interactive previews will render directly from the database once CMS publishing is enabled."
          action={
            <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
              <Link href="/contact">Request Relevant Work Samples</Link>
            </Button>
          }
        />
      </section>

      {/* 5. Technologies & Stack */}
      <section className="bg-card/55 border-y py-14">
        <div className="mx-auto max-w-6xl space-y-6 px-6">
          <div className="text-secondary flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <Layers3 className="size-4" aria-hidden="true" />
            <span>Technologies &amp; Engineering Ecosystem</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TECHNOLOGY_STACK.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="bg-card text-foreground rounded-lg px-3.5 py-2 text-xs font-medium shadow-2xs"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How ELEVANTE Works */}
      <section className="mx-auto max-w-6xl space-y-10 px-6 py-16 sm:py-20">
        <SectionHeader
          eyebrow="Process"
          title="How ELEVANTE Works"
          description="A clear, structured engagement flow designed to eliminate ambiguity before development starts."
          align="center"
        />
        <Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STAGES.map((stage) => (
              <Card key={stage.step} className="border-border/80 bg-card relative">
                <CardHeader className="space-y-2">
                  <span className="text-brand-green font-mono text-xs font-bold tracking-widest">
                    STEP {stage.step}
                  </span>
                  <CardTitle className="text-lg">{stage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {stage.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 7. Why Choose ELEVANTE */}
      <section className="bg-brand-navy border-y py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-brand-green text-xs font-semibold tracking-widest uppercase">
              Why Choose ELEVANTE
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built with real business accountability, not disposable templates.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {WHY_CHOOSE_ELEVANTE.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xs"
              >
                <h3 className="font-heading text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Founder & Co-Founder */}
      <section className="mx-auto max-w-6xl space-y-10 px-6 py-16 sm:py-20">
        <SectionHeader
          eyebrow="Leadership"
          title="Meet the Founders"
          description="Hands-on engineering and strategic execution led directly by ELEVANTE's founders."
        />
        <Reveal>
          <FoundersSection />
        </Reveal>
      </section>

      {/* 9. Testimonials (DB-Ready Slot) */}
      <section className="bg-card/45 border-y py-16">
        <div className="mx-auto max-w-6xl space-y-8 px-6">
          <SectionHeader
            eyebrow="Client Trust"
            title="Client Testimonials"
            description="Authentic client feedback is curated and published solely from verified project records."
          />
          <EmptyState
            title="Verified Client Reviews Connect via CMS"
            description="In compliance with ELEVANTE's accuracy policy, no synthetic or placeholder reviews are shown. Published client testimonials will appear here once Phase 3 & Phase 7 CMS tables are active."
          />
        </div>
      </section>

      {/* 10. Frequently Asked Questions */}
      <section className="mx-auto max-w-4xl space-y-8 px-6 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Answers"
            title="Frequently Asked Questions"
            description="Direct answers on quotations, project workflow, timelines, and file security."
          />
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/faq">View All FAQs</Link>
          </Button>
        </div>
        <FaqAccordion items={PUBLIC_FAQS.slice(0, 4)} />
      </section>

      {/* 11. Final Contact CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-md sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-widest text-white/85 uppercase">
                Ready to Build?
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tell us what you&apos;re building and receive a structured quotation.
              </h2>
              <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                Share your goals via our enquiry form or explore our core service capabilities.
                Responses arrive {AGENCY_CONTACT.responseSla.toLowerCase()}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="text-brand-navy hover:bg-brand-cream bg-white font-semibold"
              >
                <Link href="/contact" className="inline-flex items-center gap-2">
                  <span>Request a Quote</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
