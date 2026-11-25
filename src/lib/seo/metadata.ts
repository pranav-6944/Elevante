import type { Metadata } from "next";
import { getPublicEnv } from "../../config/env.ts";
import { BRAND } from "../../config/site.ts";
import { AGENCY_CONTACT } from "../content/public-defaults.ts";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, NEXT_PUBLIC_SITE_URL).toString();
  const ogImage = new URL(BRAND.logos.mark.src, NEXT_PUBLIC_SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical: normalizedPath,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      title: `${title} | ${BRAND.name}`,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: BRAND.logos.mark.width,
          height: BRAND.logos.mark.height,
          alt: BRAND.logos.mark.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND.name}`,
      description,
      images: [ogImage],
    },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: siteUrl,
    logo: new URL(BRAND.logos.mark.src, siteUrl).toString(),
    description: BRAND.description,
    email: AGENCY_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    founders: BRAND.founders.map((founder) => ({
      "@type": "Person",
      name: founder.name,
      jobTitle: founder.role,
    })),
  };
}

export function buildWebSiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: siteUrl,
    description: BRAND.description,
  };
}

export function buildBreadcrumbJsonLd(
  siteUrl: string,
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: new URL(item.path.startsWith("/") ? item.path : `/${item.path}`, siteUrl).toString(),
    })),
  };
}
