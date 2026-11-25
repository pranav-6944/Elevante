"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search } from "lucide-react";
import type { CategoryRow, PublicServiceCard } from "@/lib/services/catalog.service";
import { formatMoneyMinor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrambleText } from "@/components/common/ScrambleText";
import { VelocityHighlight } from "@/components/common/VelocityHighlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ServiceCatalogExplorer({
  categories,
  services,
}: {
  categories: CategoryRow[];
  services: PublicServiceCard[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((svc) => {
      const matchesCat = selectedCategory === "all" || svc.categorySlug === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        svc.title.toLowerCase().includes(q) ||
        svc.shortDescription.toLowerCase().includes(q) ||
        svc.categoryName.toLowerCase().includes(q) ||
        svc.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [services, selectedCategory, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <VelocityHighlight
          activeKey={selectedCategory}
          axis="auto"
          className="flex flex-wrap gap-2"
          highlightClassName="rounded-full bg-brand-gradient shadow-sm"
        >
          <button
            type="button"
            data-highlight-key="all"
            aria-pressed={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "relative z-10 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150",
              selectedCategory === "all"
                ? "[[data-vh-container]:not([data-hl-ready='true'])_&]:bg-brand-gradient border-transparent text-white delay-75"
                : "bg-card/85 text-muted-foreground hover:text-foreground"
            )}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                data-highlight-key={cat.slug}
                aria-pressed={active}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "relative z-10 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150",
                  active
                    ? "[[data-vh-container]:not([data-hl-ready='true'])_&]:bg-brand-gradient border-transparent text-white delay-75"
                    : "bg-card/85 text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </VelocityHighlight>

        <div className="relative w-full lg:w-72">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services or tech..."
            className="pl-9"
            aria-label="Search services"
          />
        </div>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <ScrambleText
          text={`Showing ${filtered.length} ${filtered.length === 1 ? "capability" : "capabilities"} in ${
            selectedCategory === "all"
              ? "All Services"
              : (categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory)
          }`}
          trigger="change"
          durationMs={360}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Matching Services"
          description="Try clearing your search filter or exploring another category."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setQuery("");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((svc) => {
            const priceText = formatMoneyMinor(svc.startingPriceMinor, svc.currency);
            return (
              <Card
                key={svc.id}
                className="border-border/80 bg-card hover:border-secondary/40 flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  {svc.thumbnailUrl ? (
                    <div className="bg-muted/20 h-44 overflow-hidden rounded-t-xl border-b">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={svc.thumbnailUrl}
                        alt={svc.thumbnailAlt ?? svc.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline" className="text-secondary text-[11px]">
                        {svc.categoryName}
                      </Badge>
                      {svc.estimatedTimeline ? (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {svc.estimatedTimeline}
                        </span>
                      ) : null}
                    </div>
                    <CardTitle className="text-xl">{svc.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {svc.shortDescription}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="space-y-4 pt-2">
                  {svc.techStack.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {svc.techStack.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-foreground text-xs font-semibold">
                      {svc.pricingMode === "quote_only" || !priceText
                        ? "Custom Quotation"
                        : svc.pricingMode === "starting_from"
                          ? `From ${priceText}`
                          : `Est. ${priceText}`}
                    </span>
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`/services/${svc.slug}`}
                        className="inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
