import Link from "next/link";
import { PUBLIC_FAQS, type FaqEntry } from "@/lib/content/public-defaults";
import { buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { getPublishedFaqs } from "@/lib/services/catalog.service";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "FAQ",
  description:
    "Clear answers about ELEVANTE services, quotation-based workflow, file security, timelines, and delivery standards.",
  path: "/faq",
});

export default async function FaqPage() {
  const dbFaqs = await getPublishedFaqs();
  const displayFaqs: FaqEntry[] =
    dbFaqs.length > 0
      ? dbFaqs.map((f) => ({
          id: f.id,
          category: "Workflow & Quotations",
          question: f.question,
          answer: f.answer,
        }))
      : PUBLIC_FAQS;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: displayFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      <SectionHeader
        eyebrow="Frequently Asked Questions"
        title="Clear Answers Before You Start"
        description="Everything you need to know about how ELEVANTE scopes, quotes, builds, and delivers digital projects."
      />

      <FaqAccordion items={displayFaqs} />

      <div className="bg-card flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Have a project-specific question?
          </h2>
          <p className="text-muted-foreground text-sm">
            Send us a brief note and we&apos;ll reply with direct guidance.
          </p>
        </div>
        <Button asChild className="bg-brand-gradient text-white hover:opacity-95">
          <Link href="/contact">Ask ELEVANTE</Link>
        </Button>
      </div>
    </div>
  );
}
