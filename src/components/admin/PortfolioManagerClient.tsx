"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deletePortfolioProjectAction,
  deleteTestimonialAction,
  togglePortfolioPublishAction,
  upsertPortfolioProjectAction,
  upsertTestimonialAction,
} from "@/actions/portfolio.actions";
import type {
  MediaAssetRow,
  PortfolioProjectRow,
  ServiceRow,
  TestimonialRow,
} from "@/lib/services/catalog.service";
import { slugify } from "@/lib/validations/services";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function PortfolioManagerClient({
  projects,
  testimonials,
  services,
  mediaAssets,
}: {
  projects: PortfolioProjectRow[];
  testimonials: TestimonialRow[];
  services: ServiceRow[];
  mediaAssets: MediaAssetRow[];
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  // Portfolio form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [coverMediaId, setCoverMediaId] = useState("");
  const [summary, setSummary] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [outcomesText, setOutcomesText] = useState("");
  const [techStackText, setTechStackText] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(projects.length);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Testimonial form state
  const [tEditingId, setTEditingId] = useState<string | null>(null);
  const [tProjectId, setTProjectId] = useState("");
  const [tAuthorName, setTAuthorName] = useState("");
  const [tAuthorRole, setTAuthorRole] = useState("");
  const [tCompany, setTCompany] = useState("");
  const [tQuote, setTQuote] = useState("");
  const [tRating, setTRating] = useState("5");
  const [tOrder, setTOrder] = useState(testimonials.length);
  const [tFeatured, setTFeatured] = useState(false);
  const [tPublished, setTPublished] = useState(false);

  function startEditTestimonial(t: TestimonialRow) {
    setTEditingId(t.id);
    setTProjectId(t.portfolio_project_id ?? "");
    setTAuthorName(t.author_name);
    setTAuthorRole(t.author_role ?? "");
    setTCompany(t.company ?? "");
    setTQuote(t.quote);
    setTRating(t.rating ? String(t.rating) : "");
    setTOrder(t.display_order);
    setTFeatured(t.is_featured);
    setTPublished(t.is_published);
    setFeedback(null);
  }

  function resetPortfolioForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setClientName("");
    setIndustry("");
    setServiceId("");
    setCoverMediaId("");
    setSummary("");
    setChallenge("");
    setSolution("");
    setOutcomesText("");
    setTechStackText("");
    setLiveUrl("");
    setDisplayOrder(projects.length);
    setIsFeatured(false);
    setIsPublished(false);
    setSeoTitle("");
    setSeoDescription("");
  }

  function startEditPortfolio(row: PortfolioProjectRow) {
    setEditingId(row.id);
    setTitle(row.title);
    setSlug(row.slug);
    setClientName(row.client_name ?? "");
    setIndustry(row.industry ?? "");
    setServiceId(row.service_id ?? "");
    setCoverMediaId(row.cover_media_id ?? "");
    setSummary(row.summary);
    setChallenge(row.challenge ?? "");
    setSolution(row.solution ?? "");
    setOutcomesText(
      Array.isArray(row.outcomes)
        ? row.outcomes.filter((v): v is string => typeof v === "string").join("\n")
        : ""
    );
    setTechStackText((row.tech_stack ?? []).join(", "));
    setLiveUrl(row.live_url ?? "");
    setDisplayOrder(row.display_order);
    setIsFeatured(row.is_featured);
    setIsPublished(row.is_published);
    setSeoTitle(row.seo_title ?? "");
    setSeoDescription(row.seo_description ?? "");
    setFeedback(null);
  }

  async function handleSavePortfolio(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertPortfolioProjectAction({
      ...(editingId ? { id: editingId } : {}),
      serviceId,
      title,
      slug,
      clientName,
      industry,
      summary,
      challenge,
      solution,
      outcomes: outcomesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      techStack: techStackText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      liveUrl,
      coverMediaId,
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

    setFeedback({
      type: "success",
      message: editingId ? "Portfolio case study updated." : "Portfolio case study created.",
    });
    resetPortfolioForm();
    router.refresh();
  }

  async function handleSaveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertTestimonialAction({
      ...(tEditingId ? { id: tEditingId } : {}),
      portfolioProjectId: tProjectId,
      authorName: tAuthorName,
      authorRole: tAuthorRole,
      company: tCompany,
      quote: tQuote,
      rating: tRating ? Number(tRating) : null,
      displayOrder: tOrder,
      isFeatured: tFeatured,
      isPublished: tPublished,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setTEditingId(null);
    setTProjectId("");
    setTAuthorName("");
    setTAuthorRole("");
    setTCompany("");
    setTQuote("");
    setTRating("5");
    setTFeatured(false);
    setTPublished(false);
    setFeedback({ type: "success", message: "Testimonial saved and cache updated." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Public Case Studies & Proof
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Portfolio & Testimonials
        </h1>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Case Studies ({projects.length})</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials ({testimonials.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? "Edit Case Study" : "New Portfolio Project"}
              </CardTitle>
              <CardDescription>
                Published case studies render directly on /portfolio and homepage Featured Work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePortfolio} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-title">Title</Label>
                    <Input
                      id="pf-title"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingId) setSlug(slugify(e.target.value));
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-slug">Slug</Label>
                    <Input
                      id="pf-slug"
                      required
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-client">Client Name</Label>
                    <Input
                      id="pf-client"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-industry">Industry</Label>
                    <Input
                      id="pf-industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-service">Service Category</Label>
                    <Select
                      value={serviceId || "_none"}
                      onValueChange={(v) => setServiceId(v === "_none" ? "" : v)}
                    >
                      <SelectTrigger id="pf-service">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Unlinked</SelectItem>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pf-cover">Cover Media</Label>
                    <Select
                      value={coverMediaId || "_none"}
                      onValueChange={(v) => setCoverMediaId(v === "_none" ? "" : v)}
                    >
                      <SelectTrigger id="pf-cover">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">None</SelectItem>
                        {mediaAssets
                          .filter((m) => m.media_type === "image")
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.file_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pf-summary">Summary</Label>
                  <Textarea
                    id="pf-summary"
                    required
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-challenge">Challenge</Label>
                    <Textarea
                      id="pf-challenge"
                      rows={3}
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-solution">Solution</Label>
                    <Textarea
                      id="pf-solution"
                      rows={3}
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-outcomes">Outcomes (1 per line)</Label>
                    <Textarea
                      id="pf-outcomes"
                      rows={3}
                      value={outcomesText}
                      onChange={(e) => setOutcomesText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-tech">Tech Stack (comma-separated)</Label>
                    <Textarea
                      id="pf-tech"
                      rows={3}
                      value={techStackText}
                      onChange={(e) => setTechStackText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-live">Live URL (Optional)</Label>
                    <Input
                      id="pf-live"
                      placeholder="https://..."
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-order">Display Order</Label>
                    <Input
                      id="pf-order"
                      type="number"
                      min={0}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-seot">SEO Title</Label>
                    <Input
                      id="pf-seot"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-seod">SEO Description</Label>
                    <Input
                      id="pf-seod"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="pf-feat">Featured on Home</Label>
                    <Switch id="pf-feat" checked={isFeatured} onCheckedChange={setIsFeatured} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="pf-pub">Published</Label>
                    <Switch id="pf-pub" checked={isPublished} onCheckedChange={setIsPublished} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                    <Plus className="size-4" aria-hidden="true" />
                    <span>{editingId ? "Update Case Study" : "Save Case Study"}</span>
                  </Button>
                  {editingId ? (
                    <Button type="button" variant="outline" onClick={resetPortfolioForm}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {projects.length === 0 ? (
              <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
                No portfolio case studies created yet.
              </Card>
            ) : (
              projects.map((p) => (
                <Card key={p.id} className="bg-card">
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={p.is_published ? "default" : "outline"}>
                          {p.is_published ? "Published" : "Draft"}
                        </Badge>
                        {p.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
                      </div>
                      <p className="text-foreground font-semibold">{p.title}</p>
                      <p className="text-muted-foreground font-mono text-xs">/portfolio/{p.slug}</p>
                      <p className="text-muted-foreground text-xs">{p.summary}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Switch
                        aria-label={`Publish ${p.title}`}
                        checked={p.is_published}
                        onCheckedChange={async () => {
                          await togglePortfolioPublishAction(p.id, p.slug, !p.is_published);
                          router.refresh();
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditPortfolio(p)}
                        aria-label="Edit case study"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          await deletePortfolioProjectAction(p.id, p.slug);
                          router.refresh();
                        }}
                        aria-label="Archive case study"
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {tEditingId ? "Edit Testimonial" : "Add Verified Client Testimonial"}
              </CardTitle>
              <CardDescription>
                Only real client endorsements saved here appear on the landing page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTestimonial} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="tm-name">Author Name</Label>
                    <Input
                      id="tm-name"
                      required
                      value={tAuthorName}
                      onChange={(e) => setTAuthorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tm-role">Role</Label>
                    <Input
                      id="tm-role"
                      value={tAuthorRole}
                      onChange={(e) => setTAuthorRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="tm-company">Company</Label>
                    <Input
                      id="tm-company"
                      value={tCompany}
                      onChange={(e) => setTCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tm-rating">Rating (1–5)</Label>
                    <Input
                      id="tm-rating"
                      type="number"
                      min={1}
                      max={5}
                      value={tRating}
                      onChange={(e) => setTRating(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tm-order">Display Order</Label>
                  <Input
                    id="tm-order"
                    type="number"
                    min={0}
                    value={tOrder}
                    onChange={(e) => setTOrder(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tm-quote">Quote</Label>
                  <Textarea
                    id="tm-quote"
                    required
                    rows={4}
                    value={tQuote}
                    onChange={(e) => setTQuote(e.target.value)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="tm-feat">Featured</Label>
                    <Switch id="tm-feat" checked={tFeatured} onCheckedChange={setTFeatured} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <Label htmlFor="tm-pub">Published</Label>
                    <Switch id="tm-pub" checked={tPublished} onCheckedChange={setTPublished} />
                  </div>
                </div>

                <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                  <Plus className="size-4" aria-hidden="true" />
                  <span>{tEditingId ? "Update Testimonial" : "Save Testimonial"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {testimonials.length === 0 ? (
              <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
                No verified testimonials yet.
              </Card>
            ) : (
              testimonials.map((t) => (
                <Card key={t.id} className="bg-card">
                  <CardContent className="flex items-start justify-between gap-4 p-4">
                    <div className="space-y-1">
                      <Badge variant={t.is_published ? "default" : "outline"}>
                        {t.is_published ? "Published" : "Draft"}
                      </Badge>
                      <p className="text-foreground text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                      <p className="text-muted-foreground text-xs">
                        — {t.author_name}
                        {t.author_role ? `, ${t.author_role}` : ""}
                        {t.company ? ` at ${t.company}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditTestimonial(t)}
                        aria-label="Edit testimonial"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          await deleteTestimonialAction(t.id);
                          router.refresh();
                        }}
                        aria-label="Delete testimonial"
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
