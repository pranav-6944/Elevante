import type { Metadata } from "next";
import { getPublicEnv } from "@/config/env";
import { BRAND } from "@/config/site";

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
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND.name}`,
      description,
    },
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
