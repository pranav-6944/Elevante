import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/config/env";

const STATIC_PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/portfolio", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  return STATIC_PUBLIC_ROUTES.map((route) => ({
    url: new URL(route.path, NEXT_PUBLIC_SITE_URL).toString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
