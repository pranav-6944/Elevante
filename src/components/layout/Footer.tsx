import Link from "next/link";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { BRAND } from "@/config/site";
import { AGENCY_CONTACT } from "@/lib/content/public-defaults";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Separator } from "@/components/ui/separator";

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

export function Footer() {
  return (
    <footer className="bg-card text-foreground border-t">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo variant="horizontal" className="h-9 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">{BRAND.description}</p>
            <p className="text-muted-foreground text-xs">
              Founded by <strong className="text-foreground">Pranav Lamkhade</strong> &amp;
              Co-Founded by <strong className="text-foreground">Omkar Sable</strong>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {FOOTER_NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Capabilities
            </h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {FOOTER_CAPABILITIES.map((cap) => (
                <li key={cap}>{cap}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
              Get in Touch
            </h3>
            <div className="text-muted-foreground space-y-2.5 text-sm">
              <a
                href={`mailto:${AGENCY_CONTACT.email}`}
                className="hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <Mail className="text-secondary size-4 shrink-0" aria-hidden="true" />
                <span>{AGENCY_CONTACT.email}</span>
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="text-secondary size-4 shrink-0" aria-hidden="true" />
                <span>{AGENCY_CONTACT.location}</span>
              </p>
            </div>
            <Link
              href="/contact"
              className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
            >
              <span>Request a Quotation</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-muted-foreground flex flex-col items-start justify-between gap-4 text-xs sm:flex-row sm:items-center">
          <p>&copy; 2026 {BRAND.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
