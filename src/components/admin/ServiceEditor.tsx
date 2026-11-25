"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { upsertServiceAction } from "@/actions/catalog.actions";
import type { CategoryRow, MediaAssetRow, ServiceRow } from "@/lib/services/catalog.service";
import { slugify } from "@/lib/validations/services";
import type { Json, PricingMode } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

function jsonArrayToLines(raw: Json | undefined): string {
  if (!Array.isArray(raw)) return "";
  return raw.filter((v): v is string => typeof v === "string").join("\n");
}

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ServiceEditor({
  service,
  categories,
  mediaAssets,
}: {
  service?: ServiceRow | null;
  categories: CategoryRow[];
  mediaAssets: MediaAssetRow[];
}) {
  const router = useRouter();
  const isNew = !service;

  const [categoryId, setCategoryId] = useState(service?.category_id ?? categories[0]?.id ?? "");
  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(service?.short_description ?? "");
  const [fullDescription, setFullDescription] = useState(service?.full_description ?? "");
  const [deliverablesText, setDeliverablesText] = useState(jsonArrayToLines(service?.deliverables));
  const [featuresText, setFeaturesText] = useState(jsonArrayToLines(service?.features));
  const [techStackText, setTechStackText] = useState((service?.tech_stack ?? []).join(", "));
  const [estimatedTimeline, setEstimatedTimeline] = useState(service?.estimated_timeline ?? "");
  const [pricingMode, setPricingMode] = useState<PricingMode>(
    service?.pricing_mode ?? "quote_only"
  );
  const [startingPriceMajor, setStartingPriceMajor] = useState(
    service?.starting_price_minor !== null && service?.starting_price_minor !== undefined
      ? String(service.starting_price_minor / 100)
      : ""
  );
  const [currency, setCurrency] = useState<"INR" | "USD">(
    service?.currency === "USD" ? "USD" : "INR"
  );
  const [thumbnailMediaId, setThumbnailMediaId] = useState(service?.thumbnail_media_id ?? "");
  const [displayOrder, setDisplayOrder] = useState(service?.display_order ?? 0);
  const [isFeatured, setIsFeatured] = useState(service?.is_featured ?? false);
  const [isPublished, setIsPublished] = useState(service?.is_published ?? false);
  const [seoTitle, setSeoTitle] = useState(service?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(service?.seo_description ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const parsedMajor = startingPriceMajor.trim();
    const startingPriceMinor =
      pricingMode === "quote_only" || parsedMajor === ""
        ? null
        : Math.round(Number(parsedMajor) * 100);

    const res = await upsertServiceAction({
      ...(service?.id ? { id: service.id } : {}),
      categoryId,
      title,
      slug,
      shortDescription,
      fullDescription,
      deliverables: linesToArray(deliverablesText),
      features: linesToArray(featuresText),
      techStack: techStackText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      estimatedTimeline,
      pricingMode,
      startingPriceMinor: Number.isFinite(startingPriceMinor) ? startingPriceMinor : null,
      currency,
      thumbnailMediaId: thumbnailMediaId || null,
      displayOrder,
      isFeatured,
      isPublished,
      seoTitle,
      seoDescription,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: isNew ? "Service created." : "Service updated." });
    if (isNew) {
      router.push(`/admin/services/${res.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-2xl">
            {isNew ? "Create Service" : `Edit: ${service.title}`}
          </CardTitle>
          <CardDescription>
            Configure deliverables, pricing hints, SEO metadata, and publication status.
          </CardDescription>
        </div>
        {!isNew ? (
          <Button asChild variant="outline">
            <Link href={`/admin/services/${service.id}/form`}>Open Dynamic Form Builder</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {feedback ? (
            <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
              {feedback.type === "success" ? (
                <CheckCircle2 className="text-brand-green size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
              <AlertTitle>{feedback.type === "success" ? "Saved" : "Error"}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-title">Service Title</Label>
              <Input
                id="svc-title"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (isNew) setSlug(slugify(val));
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-slug">URL Slug</Label>
              <Input
                id="svc-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="svc-cat">Category</Label>
              <select
                id="svc-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-timeline">Estimated Timeline</Label>
              <Input
                id="svc-timeline"
                placeholder="e.g., 2–4 weeks"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-order">Display Order</Label>
              <Input
                id="svc-order"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="svc-pricing">Pricing Mode</Label>
              <select
                id="svc-pricing"
                value={pricingMode}
                onChange={(e) => setPricingMode(e.target.value as PricingMode)}
                className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
              >
                <option value="quote_only">Custom Quote Only</option>
                <option value="starting_from">Starting From</option>
                <option value="fixed_estimate">Fixed Estimate</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-price">Starting Price ({currency})</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                disabled={pricingMode === "quote_only"}
                value={startingPriceMajor}
                onChange={(e) => setStartingPriceMajor(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-currency">Currency</Label>
              <select
                id="svc-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-short">Short Summary</Label>
            <Textarea
              id="svc-short"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-full">Detailed Service Description</Label>
            <Textarea
              id="svc-full"
              rows={5}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-deliv">Deliverables (one per line)</Label>
              <Textarea
                id="svc-deliv"
                rows={4}
                value={deliverablesText}
                onChange={(e) => setDeliverablesText(e.target.value)}
                placeholder={
                  "Responsive Next.js Frontend\nPostgreSQL Schema & APIs\nDeployment Handover"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svc-feat">Key Features (one per line)</Label>
              <Textarea
                id="svc-feat"
                rows={4}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder={
                  "SEO & Schema.org Ready\nAccessible UI Components\nAdmin Content Controls"
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-tech">Tech Stack (comma separated)</Label>
              <Input
                id="svc-tech"
                value={techStackText}
                onChange={(e) => setTechStackText(e.target.value)}
                placeholder="Next.js, TypeScript, Supabase, Tailwind CSS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-thumb">Thumbnail Media Asset</Label>
              <select
                id="svc-thumb"
                value={thumbnailMediaId}
                onChange={(e) => setThumbnailMediaId(e.target.value)}
                className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
              >
                <option value="">No thumbnail selected</option>
                {mediaAssets
                  .filter((m) => m.media_type === "image")
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.file_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <Label htmlFor="svc-featured">Featured on Landing</Label>
              <Switch id="svc-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <Label htmlFor="svc-published">Published Publicly</Label>
              <Switch id="svc-published" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-seo-title">SEO Title (Optional)</Label>
              <Input
                id="svc-seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-seo-desc">SEO Description (Optional)</Label>
              <Input
                id="svc-seo-desc"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
              <Save className="size-4" aria-hidden="true" />
              <span>{isNew ? "Create Service" : "Save Service Changes"}</span>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/services">Back to Services</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
