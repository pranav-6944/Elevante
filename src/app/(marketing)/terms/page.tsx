import { TERMS_SECTIONS } from "@/lib/content/public-defaults";
import { buildMetadata } from "@/lib/seo/metadata";
import { SectionHeader } from "@/components/marketing/SectionHeader";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description:
    "Terms governing project enquiries, quotations, deliverables, intellectual property, and acceptable use on ELEVANTE.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 px-6 py-14 sm:py-20">
      <SectionHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Effective Date: November 25, 2026 — ELEVANTE Digital Solutions"
      />

      <div className="space-y-8">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title} className="bg-card space-y-2 rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold">{section.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
