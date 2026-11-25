"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { BRAND } from "@/config/site";
import { AGENCY_CONTACT } from "@/lib/content/public-defaults";
import { BrandLogo } from "@/components/common/BrandLogo";

const FOOTER_NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const FOOTER_CAPABILITIES = [
  "Website & 3D Web Development",
  "Full-Stack Applications",
  "Data Analytics & CSV Automation",
  "AI Solutions & Workflows",
  "Branding, Logo & Deck Design",
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.97c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5A2 2 0 1 0 5.25 7.5 2 2 0 0 0 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.16 8.22C14.37 8.22 13.48 9.21 13.02 9.93V8.5H9.65C9.7 9.48 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.78 14.03 11.09 15.07 11.09C16.41 11.09 17.07 12.11 17.07 13.6V19.5H20.44V13.02Z" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-0 overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#07131e] via-[#061820] to-[#051018] pt-22 text-slate-300 sm:pt-24">
      {/* Ambient emerald glow blooms and subtle blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 -left-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(49,156,120,0.2),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 -right-24 size-96 rounded-full bg-[radial-gradient(circle,rgba(36,91,112,0.22),transparent_68%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(52,211,153,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(52,211,153,0.035)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_40%,#000_100%)] bg-[size:48px_48px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand Identity */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-white/95 px-3 py-1.5 shadow-xs ring-1 ring-white/25 transition-opacity hover:opacity-95"
            >
              <BrandLogo variant="horizontal" className="h-7 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-300/80">{BRAND.description}</p>
            <div className="rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-slate-300">
              Founded by <strong className="text-white">Pranav Lamkhade</strong> &amp; Co-Founded by{" "}
              <strong className="text-white">Omkar Sable</strong>
            </div>
          </div>

          {/* Col 2: Explore */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold tracking-[0.14em] text-emerald-300 uppercase">
              Explore
            </h2>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAVIGATION.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-slate-300/85 transition-colors hover:text-white"
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                        />
                      ) : null}
                      <span className={active ? "font-medium text-white" : undefined}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 3: Capabilities */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold tracking-[0.14em] text-emerald-300 uppercase">
              Capabilities
            </h2>
            <ul className="space-y-2.5 text-sm text-slate-300/80">
              {FOOTER_CAPABILITIES.map((cap) => (
                <li key={cap}>
                  <Link href="/services" className="transition-colors hover:text-white">
                    {cap}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Get in Touch */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-[0.14em] text-emerald-300 uppercase">
              Get in Touch
            </h2>
            <div className="space-y-2.5 text-sm text-slate-300/85">
              <a
                href={`mailto:${AGENCY_CONTACT.email}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{AGENCY_CONTACT.email}</span>
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{AGENCY_CONTACT.location}</span>
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#22c58b] to-[#1e9c83] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(34,197,139,0.28)] transition-opacity hover:opacity-95"
            >
              <span>Request a Quotation</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.linkedin.com/in/pranav-lamkhade-6b48bb372"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ELEVANTE Founder LinkedIn"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-slate-300 transition-colors hover:border-emerald-400/50 hover:text-white"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://github.com/pranav-6944"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ELEVANTE GitHub"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-slate-300 transition-colors hover:border-emerald-400/50 hover:text-white"
              >
                <GitHubIcon />
              </a>
              <a
                href={`mailto:${AGENCY_CONTACT.email}`}
                aria-label="Email ELEVANTE"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-slate-300 transition-colors hover:border-emerald-400/50 hover:text-white"
              >
                <Mail className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 py-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            &copy; {currentYear} {BRAND.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Giant decorative bottom wordmark fading cleanly into floor */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto max-w-6xl overflow-hidden px-4 select-none sm:px-6"
      >
        <p className="font-heading -mb-2 bg-gradient-to-b from-emerald-400/20 via-teal-400/10 to-transparent bg-clip-text text-center text-[15vw] leading-[0.76] font-extrabold tracking-[0.16em] text-transparent sm:-mb-3 sm:text-[7.5rem] lg:text-[10.5rem]">
          ELEVANTE
        </p>
      </div>
    </footer>
  );
}
