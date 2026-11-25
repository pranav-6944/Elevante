"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import { validateAttachmentMeta } from "@/lib/validations/projects";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProjectAttachmentUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [queued, setQueued] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleSelect(files: File[]) {
    setError(null);
    setSuccess(null);
    if (files.length === 0) return;

    for (const file of files) {
      const check = validateAttachmentMeta({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (!check.ok) {
        setError(check.message);
        return;
      }
    }

    const next = [...queued, ...files].slice(0, 5);
    setQueued(next);
  }

  async function handleUpload() {
    if (queued.length === 0) return;
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const fd = new FormData();
      for (const file of queued) {
        fd.append("files", file);
      }

      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: fd,
      });

      const json = (await res.json()) as {
        ok: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.ok) {
        setError(json.error?.message ?? "Upload failed.");
        return;
      }

      setSuccess(`Uploaded ${queued.length} file(s) securely.`);
      setQueued([]);
      router.refresh();
    } catch {
      setError("Network error while uploading files.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-background space-y-3 rounded-xl border border-dashed p-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-foreground text-sm font-medium">Upload Additional Reference Files</p>
          <p className="text-muted-foreground text-xs">
            Up to 5 files per upload · Max 25 MB each (PNG, JPG, WebP, PDF, TXT, CSV, ZIP, DOCX,
            XLSX, PPTX).
          </p>
        </div>

        <label className="bg-card hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium">
          <FileUp className="size-3.5" aria-hidden="true" />
          <span>Select Files</span>
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.md,.csv,.zip,.docx,.xlsx,.pptx"
            className="sr-only"
            onChange={(e) => {
              handleSelect(Array.from(e.target.files ?? []));
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {queued.length > 0 ? (
        <div className="space-y-2">
          <ul className="space-y-1.5 text-xs">
            {queued.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="bg-card flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5"
              >
                <span className="truncate font-medium">
                  {file.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({formatFileSize(file.size)})
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setQueued((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="bg-brand-gradient text-white"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Uploading...</span>
              </>
            ) : (
              `Upload ${queued.length} File(s)`
            )}
          </Button>
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <AlertDescription className="text-xs">{success}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
