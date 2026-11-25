import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { AGENCY_CONTACT, type FaqEntry } from "@/lib/content/public-defaults";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Reveal } from "@/components/marketing/MotionWrapper";
import { Button } from "@/components/ui/button";

function FaqSupportEmblem() {
  return (
    <svg viewBox="0 0 56 56" fill="none" aria-hidden="true" className="size-12 shrink-0">
      <defs>
        <linearGradient
          id="faq-shield-g"
          x1="22"
          y1="8"
          x2="46"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      {/* Speech bubble */}
      <rect
        x="6"
        y="14"
        width="32"
        height="24"
        rx="6"
        fill="#193446"
        stroke="#5EEAD4"
        strokeOpacity="0.4"
        strokeWidth="1.4"
      />
      <path d="M12 38L10 45L19 38" fill="#193446" />
      <path
        d="M13 22H26M13 27H23M13 32H19"
        stroke="#99F6E4"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Overlay shield */}
      <path
        d="M36 9L48 13.5V23C48 30.2 43 35.8 36 38C29 35.8 24 30.2 24 23V13.5L36 9Z"
        fill="url(#faq-shield-g)"
        stroke="#CCFBF1"
        strokeOpacity="0.75"
        strokeWidth="1.2"
      />
      <path
        d="M32 23.5L34.8 26.3L40.5 20.5"
        stroke="#062825"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeFaqSection({ items }: { items: FaqEntry[] }) {
  return (
    <section className="relative overflow-x-clip bg-gradient-to-b from-[#f4f8f6] via-[#ecf4f1] to-[#f4f8f6] pt-16 pb-24 sm:pt-20 sm:pb-28">
      {/* Subtle drafting blueprint aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(49,156,120,0.08),transparent_44%),radial-gradient(circle_at_85%_70%,rgba(36,91,112,0.08),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(23,38,79,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,38,79,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_50%,#000_45%,transparent_100%)] bg-[size:44px_44px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          {/* Left sticky intro & dark support card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1cb883] to-[#239b87] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_8px_20px_rgba(49,156,120,0.24)]">
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span>Answers</span>
              </div>

              <h2 className="font-heading text-3xl leading-[1.12] font-bold tracking-tight text-[#17264F] sm:text-4xl lg:text-[2.6rem]">
                Frequently Asked{" "}
                <span className="bg-gradient-to-r from-[#216a6c] via-[#2b9582] to-[#319C78] bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>

              <p className="text-muted-foreground max-w-md text-sm leading-relaxed sm:text-base">
                Direct answers on quotations, project workflow, timelines, and file security.
              </p>

              <Button
                asChild
                variant="outline"
                className="rounded-full border-[#17264F]/35 bg-white/80 px-5 text-[#17264F] hover:bg-white"
              >
                <Link href="/faq" className="inline-flex items-center gap-1.5">
                  <span>View All FAQs</span>
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Featured dark support card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#091527] via-[#0c2033] to-[#0a2c32] p-6 text-white shadow-[0_18px_40px_rgba(8,25,33,0.34),0_0_24px_rgba(49,156,120,0.14)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.22),transparent_68%)] blur-xl"
              />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3.5">
                  <FaqSupportEmblem />
                  <h3 className="font-heading text-lg font-bold text-white">
                    Still have questions?
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-300/85">
                  Talk directly with our engineering team for custom scope or technical feasibility.
                </p>
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-[#22c58b] to-[#1e9c83] px-5 text-white shadow-[0_8px_22px_rgba(34,197,139,0.28)] hover:opacity-95"
                >
                  <Link href="/contact" className="inline-flex items-center gap-2">
                    <span>Start a Project</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-slate-300/80">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span>Quotation-first • Reply {AGENCY_CONTACT.responseSla.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right accordion list */}
          <Reveal>
            <FaqAccordion items={items} defaultOpenFirst />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
