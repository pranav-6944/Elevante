"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { toggleDeliverableVisibilityAction } from "@/actions/workflow.actions";
import type { DeliverableRow } from "@/lib/services/portal.service";
import { formatFileSize, formatShortDate } from "@/lib/utils/format";
import { validateDeliverableFileMeta } from "@/lib/validations/workflow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function AdminDeliverablesManager({
  projectId,
  deliverables,
}: {
  projectId: string;
  deliverables: DeliverableRow[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [versionLabel, setVersionLabel] = useState("v1.0");
  const [description, setDescription] = useState("");
  const [isCustomerAccessible, setIsCustomerAccessible] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFeedback({ type: "error", message: "Please select a deliverable file first." });
      return;
    }

    const check = validateDeliverableFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!check.ok) {
      setFeedback({ type: "error", message: check.message });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("versionLabel", versionLabel || "v1.0");
      fd.set("description", description);
      fd.set("isCustomerAccessible", String(isCustomerAccessible));
      fd.set("file", file);

      const res = await fetch(`/api/admin/projects/${projectId}/deliverables`, {
        method: "POST",
        body: fd,
      });

      const json = (await res.json()) as {
        ok: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.ok) {
        setFeedback({ type: "error", message: json.error?.message ?? "Upload failed." });
        return;
      }

      setTitle("");
      setVersionLabel("v1.0");
      setDescription("");
      setFile(null);
      setFeedback({ type: "success", message: "Deliverable uploaded securely." });
      router.refresh();
    } catch {
      setFeedback({ type: "error", message: "Network error while uploading deliverable." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-base">Deliverables ({deliverables.length})</CardTitle>
        <CardDescription>
          Private storage (project-deliverables bucket · max 100 MB). Customers only see items with
          Client Access enabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {feedback ? (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
            <AlertDescription className="text-xs">{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleUpload} className="bg-background space-y-3 rounded-xl border p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
            <div className="space-y-1">
              <Label htmlFor="del-title" className="text-xs">
                Deliverable Title
              </Label>
              <Input
                id="del-title"
                required
                placeholder="Production Release Package"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="del-ver" className="text-xs">
                Version
              </Label>
              <Input
                id="del-ver"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="del-desc" className="text-xs">
              Release Notes (Optional)
            </Label>
            <Textarea
              id="del-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="del-file" className="text-xs">
                Deliverable File
              </Label>
              <Input
                id="del-file"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.mp4,.pdf,.csv,.zip,.docx,.xlsx,.pptx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex items-center justify-between self-end rounded-lg border px-3 py-2">
              <Label htmlFor="del-visible" className="text-xs font-medium">
                Release to Customer
              </Label>
              <Switch
                id="del-visible"
                checked={isCustomerAccessible}
                onCheckedChange={setIsCustomerAccessible}
              />
            </div>
          </div>

          <Button type="submit" size="sm" disabled={busy} className="bg-brand-gradient text-white">
            {busy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="size-3.5" aria-hidden="true" />
                <span>Upload Deliverable</span>
              </>
            )}
          </Button>
        </form>

        {deliverables.length === 0 ? (
          <p className="text-muted-foreground text-sm">No deliverables uploaded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {deliverables.map((del) => (
              <div
                key={del.id}
                className="bg-background flex flex-col justify-between gap-3 rounded-xl border p-3.5 text-xs sm:flex-row sm:items-center"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground font-semibold">{del.title}</span>
                    <Badge variant="outline">{del.version_label}</Badge>
                    <Badge variant={del.is_customer_accessible ? "default" : "secondary"}>
                      {del.is_customer_accessible ? "Client Visible" : "Hidden"}
                    </Badge>
                    <Badge variant="outline">{del.download_count} download(s)</Badge>
                  </div>
                  <p className="text-muted-foreground truncate">
                    {del.original_filename} · {formatFileSize(del.file_size)} ·{" "}
                    {formatShortDate(del.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    aria-label={`Toggle client visibility for ${del.title}`}
                    checked={del.is_customer_accessible}
                    onCheckedChange={async (checked) => {
                      await toggleDeliverableVisibilityAction(del.id, checked);
                      router.refresh();
                    }}
                  />
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`/api/projects/files/${del.id}/download?kind=deliverable`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      <span>Download</span>
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
