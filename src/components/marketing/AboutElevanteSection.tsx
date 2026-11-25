import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BRAND } from "@/config/site";
import { Reveal } from "@/components/marketing/MotionWrapper";

interface AboutElevanteSectionProps {
  title?: string | null;
  subtitle?: string | null;
}

const DEFAULT_TITLE =
  "One integrated agency for product engineering, data intelligence, and brand clarity.";
const DEFAULT_SUBTITLE =
  "Instead of splitting strategy across disconnected freelancers, ELEVANTE brings full-stack software engineering, automation pipelines, AI integration, and visual brand systems together under a single structured delivery workflow.";

function OrbitalDisciplinesIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-11 shrink-0 sm:size-13">
      <defs>
        <linearGradient
          id="elevante-orbit-grad"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#17264F" />
          <stop offset="55%" stopColor="#245B70" />
          <stop offset="100%" stopColor="#319C78" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="24" fill="#319C78" fillOpacity="0.1" />
      <ellipse
        cx="32"
        cy="32"
        rx="23"
        ry="10"
        transform="rotate(-28 32 32)"
        stroke="url(#elevante-orbit-grad)"
        strokeWidth="2.2"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="23"
        ry="10"
        transform="rotate(28 32 32)"
        stroke="#319C78"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="14"
        ry="21"
        stroke="#245B70"
        strokeWidth="1.8"
        strokeOpacity="0.45"
      />
      <circle cx="32" cy="32" r="7" fill="url(#elevante-orbit-grad)" />
      <circle cx="49" cy="21" r="3" fill="#319C78" />
      <circle cx="15" cy="41" r="2.5" fill="#17264F" />
    </svg>
  );
}

function ScopedQuoteSealIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-11 shrink-0 sm:size-13">
      <defs>
        <linearGradient
          id="elevante-seal-grad"
          x1="12"
          y1="10"
          x2="52"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#245B70" />
          <stop offset="100%" stopColor="#319C78" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="23" fill="#245B70" fillOpacity="0.08" />
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="#FFFFFF"
        fillOpacity="0.9"
        stroke="url(#elevante-seal-grad)"
        strokeWidth="3.2"
      />
      <circle cx="32" cy="32" r="13.5" fill="#319C78" fillOpacity="0.14" />
      <path
        d="M25.5 32.5L30 37L39 27.5"
        stroke="#1E8B6B"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArchitectureStackIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="size-11 shrink-0 sm:size-13">
      {/* Isometric 3-layer stack representing SSR + Auth + RLS */}
      <path d="M32 42L52 33L32 24L12 33L32 42Z" fill="#17264F" fillOpacity="0.88" />
      <path d="M32 34L52 25L32 16L12 25L32 34Z" fill="#245B70" fillOpacity="0.88" />
      <path
        d="M32 26L52 17L32 8L12 17L32 26Z"
        fill="#319C78"
        fillOpacity="0.92"
        stroke="#FFFFFF"
        strokeOpacity="0.6"
        strokeWidth="1.2"
      />
      <rect
        x="21"
        y="46"
        width="22"
        height="11"
        rx="4"
        fill="#FFFFFF"
        stroke="#CBD9E6"
        strokeWidth="1.5"
      />
      <path
        d="M28.5 49.5L26 51.5L28.5 53.5M35.5 49.5L38 51.5L35.5 53.5M33 49L31 54"
        stroke="#245B70"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AboutElevanteSection({ title, subtitle }: AboutElevanteSectionProps) {
  const headingText = title?.trim() || DEFAULT_TITLE;
  const bodyText = subtitle?.trim() || DEFAULT_SUBTITLE;
  const usesDefaultHeading = headingText === DEFAULT_TITLE;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      {/* Subtle drafting blueprint aura outside the glass frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(49,156,120,0.08),transparent_45%),radial-gradient(circle_at_88%_30%,rgba(36,91,112,0.08),transparent_42%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(23,38,79,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,38,79,0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,#000_55%,transparent_100%)] bg-[size:48px_48px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-[#cfe3dd] bg-gradient-to-br from-white via-[#f7fbf9] to-[#eaf6f3] p-6 shadow-[0_24px_64px_rgba(23,38,79,0.08)] sm:rounded-3xl sm:p-9 lg:p-12">
            {/* Soft luminous glow accents inside card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(49,156,120,0.16),transparent_68%)] blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-[radial-gradient(circle,rgba(36,91,112,0.12),transparent_68%)] blur-2xl"
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
              {/* Left Narrative Column */}
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1cb883] to-[#239b87] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_8px_20px_rgba(49,156,120,0.28)]">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>About ELEVANTE</span>
                </div>

                <h2 className="font-heading text-foreground text-2xl leading-[1.15] font-bold tracking-tight sm:text-3xl lg:text-[2.35rem]">
                  {usesDefaultHeading ? (
                    <>
                      One integrated agency for{" "}
                      <span className="bg-gradient-to-r from-[#1a5f66] via-[#258a7b] to-[#319c78] bg-clip-text text-transparent">
                        product engineering, data intelligence,
                      </span>{" "}
                      and{" "}
                      <span className="bg-gradient-to-r from-[#245b70] to-[#319c78] bg-clip-text text-transparent">
                        brand clarity.
                      </span>
                    </>
                  ) : (
                    headingText
                  )}
                </h2>

                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
                  {bodyText}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/about"
                    className="group relative inline-flex items-center gap-2 pb-1.5 text-sm font-semibold text-[#17264F] transition-colors hover:text-[#245B70] focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <span>Meet the founders &amp; agency philosophy</span>
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-brand-gradient absolute right-0 bottom-0 left-0 h-[2px] rounded-full opacity-75 transition-opacity group-hover:opacity-100"
                    />
                  </Link>

                  <div
                    className="flex items-center -space-x-2"
                    title={BRAND.founders.map((f) => `${f.name} (${f.role})`).join(" • ")}
                  >
                    {BRAND.founders.map((founder, idx) => (
                      <span
                        key={founder.name}
                        className={`font-heading inline-flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-xs ring-2 ring-white ${
                          idx === 0 ? "bg-[#17264F]" : "bg-[#245B70]"
                        }`}
                      >
                        {getInitials(founder.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 2x2 Elevated Metric Tiles */}
              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                {/* 1. Core Digital Disciplines */}
                <div className="group flex flex-col justify-between rounded-2xl border border-[#bce5d4] bg-gradient-to-br from-white via-[#f4fbf8] to-[#ddf4ea] p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-3xl leading-none font-bold tracking-tight text-[#17264F] tabular-nums sm:text-4xl">
                      9
                    </p>
                    <OrbitalDisciplinesIcon />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs leading-snug font-medium sm:text-sm">
                    Core Digital Disciplines
                  </p>
                </div>

                {/* 2. Custom Scoped Quotations */}
                <div className="group flex flex-col justify-between rounded-2xl border border-[#c8e0ea] bg-gradient-to-br from-white via-[#f5fafc] to-[#e4f2f7] p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-3xl leading-none font-bold tracking-tight text-[#17264F] tabular-nums sm:text-4xl">
                      100%
                    </p>
                    <ScopedQuoteSealIcon />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs leading-snug font-medium sm:text-sm">
                    Custom Scoped Quotations
                  </p>
                </div>

                {/* 3. Transparent Client Workflow */}
                <div className="group flex flex-col justify-between rounded-2xl border border-[#bfe6d7] bg-gradient-to-br from-white via-[#f4fbf9] to-[#e2f6ee] p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="space-y-3">
                    <p className="font-heading text-2xl leading-none font-bold tracking-tight text-[#17264F] sm:text-3xl">
                      4-Stage
                    </p>
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-between gap-1 pt-0.5"
                    >
                      {[1, 2, 3, 4].map((step, idx) => (
                        <div key={step} className="flex flex-1 items-center">
                          <span
                            className={`font-heading flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-xs sm:size-7 ${
                              idx === 0
                                ? "bg-brand-gradient text-white"
                                : "border border-[#9fd4c0] bg-white text-[#245B70]"
                            }`}
                          >
                            {step}
                          </span>
                          {idx < 3 ? (
                            <span className="h-[2px] flex-1 bg-gradient-to-r from-[#319C78]/70 to-[#9fd4c0]" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs leading-snug font-medium sm:text-sm">
                    Transparent Client Workflow
                  </p>
                </div>

                {/* 4. Production-Grade Foundation */}
                <div className="group flex flex-col justify-between rounded-2xl border border-[#cbd9e6] bg-gradient-to-br from-white via-[#f6f9fc] to-[#e6eef6] p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-2xl leading-[1.06] font-bold tracking-tight text-[#17264F] sm:text-[1.75rem]">
                      SSR +
                      <br />
                      RLS
                    </p>
                    <ArchitectureStackIcon />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs leading-snug font-medium sm:text-sm">
                    Production-Grade Foundation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
