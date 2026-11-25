"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteCategoryAction,
  toggleCategoryPublishAction,
  upsertCategoryAction,
} from "@/actions/catalog.actions";
import type { CategoryRow } from "@/lib/services/catalog.service";
import { slugify } from "@/lib/validations/services";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("layers");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIconName("layers");
    setDisplayOrder(categories.length);
    setIsPublished(true);
    setSeoTitle("");
    setSeoDescription("");
  }

  function startEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setIconName(cat.icon_name ?? "layers");
    setDisplayOrder(cat.display_order);
    setIsPublished(cat.is_published);
    setSeoTitle(cat.seo_title ?? "");
    setSeoDescription(cat.seo_description ?? "");
    setFeedback(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await upsertCategoryAction({
      ...(editingId ? { id: editingId } : {}),
      name,
      slug,
      description,
      iconName,
      displayOrder,
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
      message: editingId ? "Category updated." : "Category created.",
    });
    resetForm();
    router.refresh();
  }

  async function handleTogglePublish(cat: CategoryRow) {
    setBusy(true);
    const res = await toggleCategoryPublishAction(cat.id, !cat.is_published);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    setBusy(true);
    const res = await deleteCategoryAction(id);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    if (editingId === id) resetForm();
    setFeedback({ type: "success", message: "Category archived." });
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="bg-card h-fit">
        <CardHeader>
          <CardTitle className="text-xl">
            {editingId ? "Edit Category" : "Create Service Category"}
          </CardTitle>
          <CardDescription>
            Organize services cleanly for filtering and SEO taxonomy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (!editingId) setSlug(slugify(val));
                }}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-order">Display Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  min={0}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-icon">Icon Key</Label>
                <Input
                  id="cat-icon"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="globe | layers | sparkles"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 pt-3">
                <Label htmlFor="cat-pub">Published</Label>
                <Switch id="cat-pub" checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-seo-title">SEO Title (Optional)</Label>
              <Input
                id="cat-seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-seo-desc">SEO Description (Optional)</Label>
              <Textarea
                id="cat-seo-desc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                <Plus className="size-4" aria-hidden="true" />
                <span>{editingId ? "Update Category" : "Create Category"}</span>
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card className="bg-card text-muted-foreground border-dashed p-8 text-center text-sm">
            No categories found yet. Create your first service category on the left.
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="bg-card">
              <CardContent className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-foreground font-semibold">{cat.name}</h3>
                    <Badge variant={cat.is_published ? "default" : "outline"}>
                      {cat.is_published ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-xs">
                      #{cat.display_order}
                    </span>
                  </div>
                  <p className="text-muted-foreground font-mono text-xs">/{cat.slug}</p>
                  {cat.description ? (
                    <p className="text-muted-foreground text-sm">{cat.description}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => handleTogglePublish(cat)}
                  >
                    {cat.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Edit ${cat.name}`}
                    onClick={() => startEdit(cat)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Archive ${cat.name}`}
                    disabled={busy}
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
