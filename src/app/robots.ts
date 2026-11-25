import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", NEXT_PUBLIC_SITE_URL).toString(),
  };
}
