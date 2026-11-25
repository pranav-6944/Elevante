"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { deleteFaqAction, upsertFaqAction, upsertSiteSectionAction } from "@/actions/cms.actions";
import type { FaqRow, ServiceRow, SiteSectionRow } from "@/lib/services/catalog.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function CmsManagerClient({
  sections,
  faqs,
  services,
}: {
  sections: SiteSectionRow[];
  faqs: FaqRow[];
  services: ServiceRow[];
}) {
  const router = useRouter();

  // Site Section State
  const [pageKey, setPageKey] = useState(sections[0]?.page_key ?? "home");
  const [sectionKey, setSectionKey] = useState(sections[0]?.section_key ?? "hero");
  const [secTitle, setSecTitle] = useState(sections[0]?.title ?? "");
  const [secSubtitle, setSecSubtitle] = useState(sections[0]?.subtitle ?? "");
  const [secContentJson, setSecContentJson] = useState(
    JSON.stringify(sections[0]?.content ?? {}, null, 2)
  );
  const [secSeoJson, setSecSeoJson] = useState(
    JSON.stringify(sections[0]?.seo_metadata ?? {}, null, 2)
  );
  const [secPublished, setSecPublished] = useState(sections[0]?.is_published ?? true);

  // FAQ State
  const [faqEditingId, setFaqEditingId] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState("general");
  const [faqServiceId, setFaqServiceId] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqOrder, setFaqOrder] = useState(faqs.length);
  const [faqPublished, setFaqPublished] = useState(true);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function loadSection(sec: SiteSectionRow) {
    setPageKey(sec.page_key);
    setSectionKey(sec.section_key);
    setSecTitle(sec.title ?? "");
    setSecSubtitle(sec.subtitle ?? "");
    setSecContentJson(JSON.stringify(sec.content ?? {}, null, 2));
    setSecSeoJson(JSON.stringify(sec.seo_metadata ?? {}, null, 2));
    setSecPublished(sec.is_published);
    setFeedback(null);
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    const res = await upsertSiteSectionAction({
      pageKey,
      sectionKey,
      title: secTitle,
      subtitle: secSubtitle,
      contentJson: secContentJson,
      seoMetadataJson: secSeoJson,
      isPublished: secPublished,
    });
    setBusy(false);

    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: `Section ${pageKey}/${sectionKey} saved.` });
    router.refresh();
  }

  function resetFaq() {
    setFaqEditingId(null);
    setFaqCategory("general");
    setFaqServiceId("");
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqOrder(faqs.length);
    setFaqPublished(true);
  }

  function startEditFaq(faq: FaqRow) {
    setFaqEditingId(faq.id);
    setFaqCategory(faq.category);
    setFaqServiceId(faq.service_id ?? "");
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqOrder(faq.display_order);
    setFaqPublished(faq.is_published);
    setFeedback(null);
  }

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertFaqAction({
      ...(faqEditingId ? { id: faqEditingId } : {}),
      category: faqCategory,
      serviceId: faqServiceId || null,
      question: faqQuestion,
      answer: faqAnswer,
      displayOrder: faqOrder,
      isPublished: faqPublished,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: faqEditingId ? "FAQ updated." : "FAQ created." });
    resetFaq();
    router.refresh();
  }

  async function handleDeleteFaq(id: string) {
    setBusy(true);
    const res = await deleteFaqAction(id);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    if (faqEditingId === id) resetFaq();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Website Content &amp; FAQs
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage editable page sections, headings, SEO metadata, and published FAQs.
        </p>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          {feedback.type === "success" ? (
            <CheckCircle2 className="text-brand-green size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <AlertTitle>{feedback.type === "success" ? "Updated" : "Error"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">Website Sections ({sections.length})</TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-3">
              {sections.map((sec) => (
                <Card
                  key={sec.id}
                  className="bg-card hover:border-secondary cursor-pointer transition-colors"
                  onClick={() => loadSection(sec)}
                >
                  <CardContent className="flex items-center justify-between gap-2 py-4">
                    <div>
                      <p className="text-secondary font-mono text-xs font-semibold">
                        {sec.page_key} / {sec.section_key}
                      </p>
                      <p className="text-foreground line-clamp-1 text-sm font-medium">
                        {sec.title || "Untitled section"}
                      </p>
                    </div>
                    <Badge variant={sec.is_published ? "default" : "outline"}>
                      {sec.is_published ? "Live" : "Hidden"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Edit Section Content</CardTitle>
                <CardDescription>
                  Updates immediately purge cached public pages via Next.js cache tags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSection} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sec-page">Page Key</Label>
                      <Input
                        id="sec-page"
                        value={pageKey}
                        onChange={(e) => setPageKey(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sec-key">Section Key</Label>
                      <Input
                        id="sec-key"
                        value={sectionKey}
                        onChange={(e) => setSectionKey(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sec-title">Heading / Title</Label>
                    <Input
                      id="sec-title"
                      value={secTitle}
                      onChange={(e) => setSecTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sec-sub">Subtitle / Lead Copy</Label>
                    <Textarea
                      id="sec-sub"
                      rows={3}
                      value={secSubtitle}
                      onChange={(e) => setSecSubtitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sec-json">Content JSON</Label>
                      <Textarea
                        id="sec-json"
                        rows={5}
                        className="font-mono text-xs"
                        value={secContentJson}
                        onChange={(e) => setSecContentJson(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sec-seo">SEO Metadata JSON</Label>
                      <Textarea
                        id="sec-seo"
                        rows={5}
                        className="font-mono text-xs"
                        value={secSeoJson}
                        onChange={(e) => setSecSeoJson(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                    <Label htmlFor="sec-pub">Published</Label>
                    <Switch id="sec-pub" checked={secPublished} onCheckedChange={setSecPublished} />
                  </div>

                  <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                    <Save className="size-4" aria-hidden="true" />
                    <span>Save Section</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faqs">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-card h-fit">
              <CardHeader>
                <CardTitle>{faqEditingId ? "Edit FAQ" : "Add FAQ Entry"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveFaq} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="faq-cat">Category</Label>
                      <Input
                        id="faq-cat"
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faq-order">Order</Label>
                      <Input
                        id="faq-order"
                        type="number"
                        min={0}
                        value={faqOrder}
                        onChange={(e) => setFaqOrder(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faq-svc">Link to Service (Optional)</Label>
                    <select
                      id="faq-svc"
                      value={faqServiceId}
                      onChange={(e) => setFaqServiceId(e.target.value)}
                      className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">General FAQ (All Pages)</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faq-q">Question</Label>
                    <Input
                      id="faq-q"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faq-a">Answer</Label>
                    <Textarea
                      id="faq-a"
                      rows={4}
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                    <Label htmlFor="faq-pub">Published</Label>
                    <Switch id="faq-pub" checked={faqPublished} onCheckedChange={setFaqPublished} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                      <Plus className="size-4" aria-hidden="true" />
                      <span>{faqEditingId ? "Update FAQ" : "Add FAQ"}</span>
                    </Button>
                    {faqEditingId ? (
                      <Button type="button" variant="outline" onClick={resetFaq}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {faqs.length === 0 ? (
                <Card className="bg-card text-muted-foreground border-dashed p-8 text-center text-sm">
                  No database FAQs yet. Public /faq falls back gracefully to factual agency FAQs
                  until you publish custom entries here.
                </Card>
              ) : (
                faqs.map((faq) => (
                  <Card key={faq.id} className="bg-card">
                    <CardContent className="flex items-start justify-between gap-4 py-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={faq.is_published ? "default" : "outline"}>
                            {faq.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{faq.category}</Badge>
                        </div>
                        <p className="text-foreground font-medium">{faq.question}</p>
                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEditFaq(faq)}
                          aria-label="Edit FAQ"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => handleDeleteFaq(faq.id)}
                          aria-label="Delete FAQ"
                        >
                          <Trash2 className="text-destructive size-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
