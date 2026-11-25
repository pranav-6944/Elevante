"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Copy, FileText, Trash2, Upload } from "lucide-react";
import { deleteMediaAssetAction } from "@/actions/cms.actions";
import type { MediaAssetRow } from "@/lib/services/catalog.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaManagerClient({ assets }: { assets: MediaAssetRow[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFeedback({ type: "error", message: "Choose a file before uploading." });
      return;
    }

    setBusy(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", altText);
    formData.append("caption", caption);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const json = (await response.json()) as {
        ok: boolean;
        error?: { message?: string };
      };

      if (!json.ok) {
        setFeedback({ type: "error", message: json.error?.message ?? "Upload failed." });
        setBusy(false);
        return;
      }

      setFile(null);
      setAltText("");
      setCaption("");
      setFeedback({ type: "success", message: "Media uploaded to public-media bucket." });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Network error during upload." });
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy(asset: MediaAssetRow) {
    await navigator.clipboard.writeText(asset.public_url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleDelete(id: string) {
    setBusy(true);
    const res = await deleteMediaAssetAction(id);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    setFeedback({ type: "success", message: "Media asset removed." });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground text-sm">
          Upload optimized images, videos, and documents into the `public-media` Storage bucket.
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Upload Public Asset</CardTitle>
          <CardDescription>
            Allowed: PNG, JPEG, WebP, AVIF, MP4, WebM, PDF (up to 50 MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {feedback ? (
              <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
                {feedback.type === "success" ? (
                  <CheckCircle2 className="text-brand-green size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                <AlertTitle>{feedback.type === "success" ? "Success" : "Notice"}</AlertTitle>
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="media-file">File</Label>
                <Input
                  id="media-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,video/mp4,video/webm,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-alt">Descriptive Alt Text</Label>
                <Input
                  id="media-alt"
                  placeholder="SEO & accessibility description"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-cap">Caption (Optional)</Label>
                <Input
                  id="media-cap"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
              <Upload className="size-4" aria-hidden="true" />
              <span>{busy ? "Uploading..." : "Upload Asset"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {assets.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No media assets uploaded yet.
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="bg-card overflow-hidden">
              <div className="bg-muted/30 flex h-40 items-center justify-center border-b p-3">
                {asset.media_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.public_url}
                    alt={asset.alt_text ?? asset.file_name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <FileText className="text-secondary size-10" aria-hidden="true" />
                )}
              </div>
              <CardContent className="space-y-3 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{asset.file_name}</p>
                  <Badge variant="outline">{asset.media_type}</Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {Math.round(asset.file_size / 1024)} KB • {asset.mime_type}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopy(asset)}
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    <span>{copiedId === asset.id ? "Copied" : "Copy URL"}</span>
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${asset.file_name}`}
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
