import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Work_Sans } from "next/font/google";
import { BRAND } from "@/config/site";
import { getPublicEnv } from "@/config/env";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  return {
    metadataBase: new URL(NEXT_PUBLIC_SITE_URL),
    title: {
      default: `${BRAND.name} — ${BRAND.tagline}`,
      template: `%s | ${BRAND.name}`,
    },
    description: BRAND.description,
    applicationName: BRAND.name,
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      title: `${BRAND.name} — ${BRAND.tagline}`,
      description: BRAND.description,
      url: NEXT_PUBLIC_SITE_URL,
    },
  };
}

export const viewport: Viewport = {
  themeColor: BRAND.colors.deepNavy,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${workSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">{children}</body>
    </html>
  );
}
