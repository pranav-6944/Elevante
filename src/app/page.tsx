import Link from "next/link";
import { ShieldCheck, Layers, Database, Sparkles } from "lucide-react";
import { BRAND } from "@/config/site";
import { isSupabaseConfigured } from "@/config/env";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const FOUNDATION_PILLARS = [
  {
    icon: Layers,
    title: "Design System & Brand Tokens",
    description:
      "Configured Tailwind CSS v4, shadcn/ui (Radix primitives), Outfit & Work Sans typography, and Elevante's official palette.",
  },
  {
    icon: Database,
    title: "Supabase Client Boundary",
    description:
      "Browser, SSR cookie-aware server, and server-only admin clients typed and guarded with Zod environment validation.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Error Recovery",
    description:
      "HTTP security headers, centralized ActionResult error handling, custom 404/500 error boundaries, and health monitoring.",
  },
];

export default function HomePage() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-card/90 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-2">
            <BrandLogo variant="horizontal" className="h-9 w-auto" priority />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-medium">
              Phase 1 Foundation
            </Badge>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-6 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="bg-card text-secondary inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-xs">
              <Sparkles className="text-brand-green size-3.5" aria-hidden="true" />
              <span>Digital Solutions Agency Platform</span>
            </div>

            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              Engineering <span className="text-brand-gradient">modern digital products</span> with
              production discipline.
            </h1>

            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
              {BRAND.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-brand-gradient text-white hover:opacity-95">
                <Link href="/api/health">Verify Health Endpoint</Link>
              </Button>
              <Badge variant="outline" className="px-3 py-1.5 text-xs">
                Supabase Env: {supabaseReady ? "Configured" : "Awaiting Phase 3 Keys"}
              </Badge>
            </div>
          </div>

          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className="items-center text-center">
              <BrandLogo variant="vertical" className="h-36 w-auto" />
              <CardTitle className="pt-2 text-lg">Brand Identity Tokens</CardTitle>
              <CardDescription>Verified palette & gradient system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="bg-brand-gradient h-12 w-full rounded-xl shadow-inner"
                aria-label="Elevante primary brand gradient"
              />
              <div className="grid grid-cols-5 gap-2 text-center font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="bg-brand-navy h-8 rounded-md" />
                  <span>#17264F</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-brand-teal h-8 rounded-md" />
                  <span>#245B70</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-brand-green h-8 rounded-md" />
                  <span>#319C78</span>
                </div>
                <div className="space-y-1">
                  <div className="bg-brand-cream h-8 rounded-md border" />
                  <span>#F5F6F2</span>
                </div>
                <div className="space-y-1">
                  <div className="h-8 rounded-md border bg-white" />
                  <span>#FFFFFF</span>
                </div>
              </div>
              <Separator />
              <p className="text-muted-foreground text-center text-xs">
                Next Milestone: <strong className="text-foreground">Phase 2</strong> — Public
                Website & Marketing Pages
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FOUNDATION_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="bg-card/90">
                <CardHeader className="space-y-2">
                  <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
