import { Clock, Mail, MapPin, ShieldCheck } from "lucide-react";
import { getPublicEnv } from "@/config/env";
import { AGENCY_CONTACT } from "@/lib/content/public-defaults";
import { buildBreadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact ELEVANTE to discuss website development, 3D web experiences, AI workflows, data analytics, or brand design and receive a tailored quotation.",
  path: "/contact",
});

export default function ContactPage() {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ELEVANTE",
    url: new URL("/contact", NEXT_PUBLIC_SITE_URL).toString(),
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(NEXT_PUBLIC_SITE_URL, [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <SectionHeader
        eyebrow="Contact ELEVANTE"
        title="Start a Conversation About Your Project"
        description="Share your requirements and goals. We review every brief thoroughly before scheduling a discovery step or preparing your quotation."
      />

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <ContactForm />

        <div className="space-y-5">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Direct Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="text-secondary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-foreground font-medium">Email</p>
                  <a
                    href={`mailto:${AGENCY_CONTACT.email}`}
                    className="hover:text-foreground underline-offset-4 hover:underline"
                  >
                    {AGENCY_CONTACT.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-secondary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-foreground font-medium">Location</p>
                  <p>{AGENCY_CONTACT.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-secondary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-foreground font-medium">Typical Response Time</p>
                  <p>{AGENCY_CONTACT.responseSla}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/30 bg-accent/55">
            <CardHeader className="flex flex-row items-center gap-2.5 space-y-0">
              <ShieldCheck className="text-secondary size-5" aria-hidden="true" />
              <CardTitle className="text-base">Quotation-First Confidentiality</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              Your enquiry details are used strictly to assess scope and prepare an accurate project
              proposal. No spam, no third-party data sharing.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
