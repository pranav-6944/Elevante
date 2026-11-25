import type { ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";
import type { AdvantageItem } from "@/lib/content/public-defaults";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/MotionWrapper";

function ArchitectureLayersCodeIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <defs>
        <linearGradient
          id="why-stack-top"
          x1="12"
          y1="12"
          x2="54"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <circle cx="34" cy="36" r="24" fill="#319C78" fillOpacity="0.16" />
      <path
        d="M32 52L52 43L32 34L12 43L32 52Z"
        fill="#1E4B5A"
        fillOpacity="0.88"
        stroke="#5EEAD4"
        strokeOpacity="0.3"
      />
      <path
        d="M32 42L52 33L32 24L12 33L32 42Z"
        fill="#23646E"
        fillOpacity="0.92"
        stroke="#5EEAD4"
        strokeOpacity="0.45"
      />
      <path
        d="M32 32L52 23L32 14L12 23L32 32Z"
        fill="url(#why-stack-top)"
        fillOpacity="0.95"
        stroke="#ECFDF5"
        strokeOpacity="0.7"
      />
      {/* Foreground code badge */}
      <rect
        x="33"
        y="39"
        width="36"
        height="25"
        rx="6"
        fill="#13253F"
        stroke="#5EEAD4"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <circle cx="39" cy="44" r="1.3" fill="#34D399" />
      <circle cx="43.5" cy="44" r="1.3" fill="#2DD4BF" fillOpacity="0.7" />
      <path
        d="M46 50.5L42.5 53.5L46 56.5M56 50.5L59.5 53.5L56 56.5M52.5 49.5L49.5 57.5"
        stroke="#6EE7B7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EngineeringDesignAiIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <defs>
        <linearGradient
          id="why-hex-grad"
          x1="12"
          y1="10"
          x2="54"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="25" fill="#2DD4BF" fillOpacity="0.14" />
      <polygon
        points="31,12 49,22 49,42 31,52 13,42 13,22"
        fill="url(#why-hex-grad)"
        stroke="#5EEAD4"
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <path
        d="M24 28L31 24L38 28V36L31 40L24 36V28Z"
        stroke="#6EE7B7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* AI chip node */}
      <rect
        x="37"
        y="38"
        width="28"
        height="28"
        rx="7"
        fill="#102C3D"
        stroke="#34D399"
        strokeOpacity="0.7"
        strokeWidth="1.5"
      />
      <path
        d="M45 35V38M51 35V38M57 35V38M45 66V69M51 66V69M57 66V69M34 46H37M34 52H37M34 58H37M65 46H68M65 52H68M65 58H68"
        stroke="#5EEAD4"
        strokeOpacity="0.65"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text
        x="51"
        y="56"
        textAnchor="middle"
        fill="#A7F3D0"
        fontSize="12"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
      >
        AI
      </text>
    </svg>
  );
}

function QuotationShieldIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <defs>
        <linearGradient
          id="why-shield-grad"
          x1="16"
          y1="12"
          x2="48"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <circle cx="34" cy="36" r="24" fill="#319C78" fillOpacity="0.16" />
      <path
        d="M32 14L49 21V36C49 47.5 41.5 56.5 32 60C22.5 56.5 15 47.5 15 36V21L32 14Z"
        fill="url(#why-shield-grad)"
        fillOpacity="0.88"
        stroke="#A7F3D0"
        strokeOpacity="0.75"
        strokeWidth="1.5"
      />
      <path
        d="M25.5 36.5L30 41L39.5 31"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Scope clipboard */}
      <rect
        x="42"
        y="34"
        width="25"
        height="32"
        rx="5"
        fill="#13263E"
        stroke="#5EEAD4"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <rect x="49" y="31" width="11" height="5" rx="2" fill="#34D399" />
      <circle cx="48.5" cy="44" r="1.6" fill="#34D399" />
      <path
        d="M53 44H62"
        stroke="#99F6E4"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="48.5" cy="51" r="1.6" fill="#34D399" />
      <path
        d="M53 51H61"
        stroke="#99F6E4"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="48.5" cy="58" r="1.6" fill="#34D399" />
      <path
        d="M53 58H59"
        stroke="#99F6E4"
        strokeOpacity="0.7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeedSeoGaugeIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className="size-16 shrink-0 sm:size-[74px]"
    >
      <defs>
        <linearGradient
          id="why-gauge-arc"
          x1="16"
          y1="48"
          x2="60"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
      </defs>
      <circle cx="38" cy="40" r="24" fill="#34D399" fillOpacity="0.16" />
      <path d="M17 48A21 21 0 1 1 56 48" stroke="#1E3A5F" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M17 48A21 21 0 0 1 54 27"
        stroke="url(#why-gauge-arc)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="36.5" cy="41" r="4" fill="#A7F3D0" />
      <path d="M38.5 39L49 27" stroke="#ECFDF5" strokeWidth="2.6" strokeLinecap="round" />
      {/* Clean CWV badge */}
      <circle cx="53" cy="52" r="13.5" fill="#0B2430" stroke="#34D399" strokeWidth="2" />
      <path
        d="M48 52.5L51.5 56L58.5 48.5"
        stroke="#6EE7B7"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 18L59.2 21.3L62.5 22.5L59.2 23.7L58 27L56.8 23.7L53.5 22.5L56.8 21.3L58 18Z"
        fill="#6EE7B7"
      />
    </svg>
  );
}

interface CardPresentation {
  icon: () => ReactNode;
  tags?: readonly string[];
  flowChip?: string;
  verifiedChip?: string;
}

const CARD_PRESENTATION: readonly CardPresentation[] = [
  {
    icon: ArchitectureLayersCodeIcon,
    tags: ["TypeScript", "SSR", "PostgreSQL"],
  },
  {
    icon: EngineeringDesignAiIcon,
    flowChip: "Brand → Full-Stack → AI",
  },
  {
    icon: QuotationShieldIcon,
    verifiedChip: "Itemized Scope • Zero Surprises",
  },
  {
    icon: SpeedSeoGaugeIcon,
    tags: ["SEO", "Core Web Vitals", "WCAG"],
  },
];

export function WhyChooseElevanteSection({ items }: { items: readonly AdvantageItem[] }) {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#091326] py-16 text-white sm:py-22">
      {/* Deep dark emerald/navy radial atmosphere and blueprint wireframe corners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(49,156,120,0.22),transparent_42%),radial-gradient(circle_at_12%_86%,rgba(36,91,112,0.28),transparent_46%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(52,211,153,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,211,153,0.045)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_45%,#000_100%)] bg-[size:44px_44px]"
      />

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/12 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-emerald-300 uppercase shadow-[0_0_24px_rgba(49,156,120,0.18)]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Why Choose ELEVANTE</span>
            </div>
            <h2 className="font-heading text-3xl leading-[1.14] font-bold tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
              Built with{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                real business accountability
              </span>
              , not disposable templates.
            </h2>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm lg:mt-1">
            100% Custom Architecture • Zero Generic Templates
          </div>
        </div>

        {/* 2x2 Elevated Dark Glass Grid */}
        <Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
            {items.map((item, idx) => {
              const presentation = CARD_PRESENTATION[idx] ?? CARD_PRESENTATION[0]!;
              const IconVisual = presentation.icon;
              const isPrimaryCard = idx === 0;

              return (
                <article
                  key={item.title}
                  className={cn(
                    "group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 sm:flex-row sm:gap-5 sm:p-7",
                    isPrimaryCard
                      ? "border-emerald-400/55 bg-gradient-to-br from-[#122645]/95 via-[#10253c]/95 to-[#0c2e34]/95 shadow-[0_0_32px_rgba(52,211,153,0.16),0_20px_40px_-14px_rgba(0,0,0,0.55)] hover:border-emerald-300/80 hover:shadow-[0_0_40px_rgba(52,211,153,0.24)]"
                      : "border-white/12 bg-gradient-to-br from-[#101c35]/90 via-[#0f1f36]/90 to-[#0c2131]/90 shadow-[0_18px_36px_-14px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:border-emerald-400/45 hover:shadow-[0_0_30px_rgba(52,211,153,0.14)]"
                  )}
                >
                  {/* Top-right emerald corner rim shimmer matching reference aesthetic */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.22),transparent_68%)] blur-xl transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <IconVisual />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-heading text-lg leading-snug font-bold text-white sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-300/85">
                        {item.description}
                      </p>
                    </div>

                    {presentation.tags ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {presentation.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 font-mono text-[11px] font-medium text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {presentation.flowChip ? (
                      <div className="pt-1">
                        <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-200">
                          {presentation.flowChip}
                        </span>
                      </div>
                    ) : null}

                    {presentation.verifiedChip ? (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-100">
                          <span className="bg-brand-green inline-flex size-4 items-center justify-center rounded-sm text-white">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                          <span>{presentation.verifiedChip}</span>
                        </span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
