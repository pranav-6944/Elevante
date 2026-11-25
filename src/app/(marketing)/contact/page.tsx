import { Clock, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { getPublicEnv } from "@/config/env";
import { AGENCY_CONTACT } from "@/lib/content/public-defaults";
import { buildBreadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo/metadata";
import { ContactForm } from "@/components/marketing/ContactForm";
import { CopyEmailButton } from "@/components/marketing/CopyEmailButton";

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
    <div className="relative z-20 bg-gradient-to-b from-[#f4f8f6] via-[#ecf4f1] to-[#f4f8f6] py-14 sm:py-20">
      {/* Subtle architectural blueprint aura */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(49,156,120,0.09),transparent_44%),radial-gradient(circle_at_88%_30%,rgba(36,91,112,0.08),transparent_44%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(23,38,79,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,38,79,0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_40%,#000_45%,transparent_100%)] bg-[size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        />

        {/* Page Hero Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1cb883] to-[#239b87] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_8px_20px_rgba(49,156,120,0.24)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            <span>Contact ELEVANTE</span>
          </div>

          <h1 className="font-heading text-3xl leading-[1.12] font-bold tracking-tight text-[#17264F] sm:text-4xl lg:text-5xl">
            Start a Conversation About{" "}
            <span className="bg-gradient-to-r from-[#216a6c] via-[#2b9582] to-[#319C78] bg-clip-text text-transparent">
              Your Project
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
            Share your requirements and goals. We review every brief thoroughly before scheduling a
            discovery step or preparing your quotation.
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid items-start gap-8 lg:grid-cols-[1.22fr_0.78fr]">
          <ContactForm />

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-[#091527] px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] text-emerald-300 uppercase shadow-sm">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Direct Line</span>
            </div>

            {/* Dark Obsidian Direct Contact Card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#091527] via-[#0c2033] to-[#0a2c32] p-6 text-white shadow-[0_18px_40px_rgba(8,25,33,0.34),0_0_24px_rgba(49,156,120,0.14)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.22),transparent_68%)] blur-xl"
              />
              <div className="relative z-10 space-y-4">
                <h2 className="font-heading text-lg font-bold text-white">
                  Direct Contact Details
                </h2>

                <div className="space-y-3 text-sm">
                  {/* Email Row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300">
                        <Mail className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-300/80">Email</p>
                        <a
                          href={`mailto:${AGENCY_CONTACT.email}`}
                          className="block truncate font-medium text-white underline-offset-4 hover:underline"
                        >
                          {AGENCY_CONTACT.email}
                        </a>
                      </div>
                    </div>
                    <CopyEmailButton email={AGENCY_CONTACT.email} />
                  </div>

                  {/* Location Row */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300">
                      <MapPin className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-300/80">Location</p>
                      <p className="font-medium text-white">{AGENCY_CONTACT.location}</p>
                    </div>
                  </div>

                  {/* SLA Row */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/15 text-emerald-300">
                      <Clock className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-300/80">Typical Response Time</p>
                      <p className="font-medium text-white">{AGENCY_CONTACT.responseSla}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mint Glass Confidentiality Card */}
            <div className="rounded-2xl border border-[#bde3d4] bg-gradient-to-br from-white via-[#f3fbf7] to-[#e2f4ed] p-6 shadow-xs">
              <div className="flex items-start gap-3.5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/35 bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <h2 className="font-heading text-base font-bold text-[#17264F]">
                    Quotation-First Confidentiality
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Your enquiry details are used strictly to assess scope and prepare an accurate
                    project proposal. No spam, no third-party data sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
