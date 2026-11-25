"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileUp, Paperclip, X } from "lucide-react";
import type { PortalServiceOption } from "@/lib/services/portal.service";
import { formatFileSize, formatMoneyMinor } from "@/lib/utils/format";
import {
  createProjectRequestSchema,
  MAX_ATTACHMENTS_PER_REQUEST,
  PROJECT_PRIORITIES,
  validateAttachmentMeta,
} from "@/lib/validations/projects";
import { DynamicServiceForm } from "@/components/services/DynamicServiceForm";
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
import { Textarea } from "@/components/ui/textarea";
import type { ProjectPriority } from "@/types/database";

interface StartProjectFormProps {
  services: PortalServiceOption[];
  initialSlug?: string;
}

export function StartProjectForm({ services, initialSlug }: StartProjectFormProps) {
  const router = useRouter();

  const initialService = services.find((s) => s.slug === initialSlug) ?? services[0];

  const [selectedServiceId, setSelectedServiceId] = useState(initialService.id);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("normal");
  const [desiredDeadline, setDesiredDeadline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");

  const [fieldFiles, setFieldFiles] = useState<Record<string, File[]>>({});
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [coreErrors, setCoreErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? services[0],
    [services, selectedServiceId]
  );

  const priceLabel = formatMoneyMinor(selectedService.startingPriceMinor, selectedService.currency);

  function countTotalQueuedFiles(
    nextFieldFiles: Record<string, File[]>,
    nextRefFiles: File[]
  ): number {
    const fieldCount = Object.values(nextFieldFiles).reduce((sum, list) => sum + list.length, 0);
    return fieldCount + nextRefFiles.length;
  }

  function validateQueuedFiles(filesToCheck: File[]): string | null {
    for (const file of filesToCheck) {
      const check = validateAttachmentMeta({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (!check.ok) return check.message;
    }
    return null;
  }

  function handleFieldFilesChange(fieldKey: string, picked: File[]) {
    setSubmitError(null);
    const invalidMsg = validateQueuedFiles(picked);
    if (invalidMsg) {
      setSubmitError(invalidMsg);
      return;
    }

    const nextFieldMap = { ...fieldFiles, [fieldKey]: picked };
    if (countTotalQueuedFiles(nextFieldMap, referenceFiles) > MAX_ATTACHMENTS_PER_REQUEST) {
      setSubmitError(`You can attach up to ${MAX_ATTACHMENTS_PER_REQUEST} files per submission.`);
      return;
    }

    setFieldFiles(nextFieldMap);
  }

  function handleAddReferenceFiles(picked: File[]) {
    if (picked.length === 0) return;
    setSubmitError(null);
    const invalidMsg = validateQueuedFiles(picked);
    if (invalidMsg) {
      setSubmitError(invalidMsg);
      return;
    }

    const nextRef = [...referenceFiles, ...picked];
    if (countTotalQueuedFiles(fieldFiles, nextRef) > MAX_ATTACHMENTS_PER_REQUEST) {
      setSubmitError(`You can attach up to ${MAX_ATTACHMENTS_PER_REQUEST} files per submission.`);
      return;
    }

    setReferenceFiles(nextRef);
  }

  function handleServiceChange(nextId: string) {
    setSelectedServiceId(nextId);
    setFieldFiles({});
    setSubmitError(null);
  }

  async function handleSubmit(dynamicValues: Record<string, unknown>) {
    setSubmitError(null);
    setCoreErrors({});

    const coreCheck = createProjectRequestSchema.safeParse({
      serviceId: selectedService.id,
      title,
      summary,
      priority,
      desiredDeadline,
      budgetRange,
      dynamicResponses: dynamicValues,
    });

    if (!coreCheck.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of coreCheck.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "_root";
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setCoreErrors(nextErrors);
      setSubmitError(
        nextErrors._root ?? "Please complete all required core project details above."
      );
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(coreCheck.data));

      const fileFieldKeys: string[] = [];
      for (const [fieldKey, files] of Object.entries(fieldFiles)) {
        for (const file of files) {
          fd.append("files", file);
          fileFieldKeys.push(fieldKey);
        }
      }
      for (const file of referenceFiles) {
        fd.append("files", file);
        fileFieldKeys.push("_reference");
      }
      fd.set("fileFieldKeys", JSON.stringify(fileFieldKeys));

      const res = await fetch("/api/projects", {
        method: "POST",
        body: fd,
      });

      const json = (await res.json()) as {
        ok: boolean;
        data?: { id: string; projectCode: string };
        error?: { message?: string; fieldErrors?: Record<string, string[]> };
      };

      if (!res.ok || !json.ok || !json.data) {
        const fieldMessages = json.error?.fieldErrors
          ? Object.values(json.error.fieldErrors).flat().slice(0, 3).join(" ")
          : "";
        setSubmitError(
          [json.error?.message ?? "Submission failed.", fieldMessages].filter(Boolean).join(" ")
        );
        return;
      }

      router.push(`/dashboard/projects/${json.data.id}`);
      router.refresh();
    } catch {
      setSubmitError("Network error while submitting your project request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">1. Select Service & Project Overview</CardTitle>
          <CardDescription>
            Choose a service capability and share your high-level project objectives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="service-select">Service Capability</Label>
              <Select value={selectedService.id} onValueChange={handleServiceChange}>
                <SelectTrigger id="service-select">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((svc) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.title} ({svc.categoryName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-background flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3 text-xs">
              <Badge variant="secondary">{selectedService.categoryName}</Badge>
              {selectedService.estimatedTimeline ? (
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {selectedService.estimatedTimeline}
                </span>
              ) : null}
              <Badge variant="outline">
                {selectedService.pricingMode === "quote_only" || !priceLabel
                  ? "Custom Quotation"
                  : selectedService.pricingMode === "starting_from"
                    ? `From ${priceLabel}`
                    : `Est. ${priceLabel}`}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-title">
              Project Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-title"
              placeholder="e.g., Customer SaaS Web Platform & Analytics Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(coreErrors.title)}
            />
            {coreErrors.title ? (
              <p className="text-destructive text-xs">{coreErrors.title}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-summary">
              Project Goals & Scope Summary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="project-summary"
              rows={4}
              placeholder="Describe what you want to build, target users, key workflows, and any important technical constraints."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              aria-invalid={Boolean(coreErrors.summary)}
            />
            {coreErrors.summary ? (
              <p className="text-destructive text-xs">{coreErrors.summary}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="project-priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as ProjectPriority)}>
                <SelectTrigger id="project-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-deadline">Desired Target Date</Label>
              <Input
                id="project-deadline"
                type="date"
                value={desiredDeadline}
                onChange={(e) => setDesiredDeadline(e.target.value)}
                aria-invalid={Boolean(coreErrors.desiredDeadline)}
              />
              {coreErrors.desiredDeadline ? (
                <p className="text-destructive text-xs">{coreErrors.desiredDeadline}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-budget">Expected Budget Range (Optional)</Label>
              <Input
                id="project-budget"
                placeholder="e.g., INR 75,000 - 1,50,000"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">
            2. {selectedService.title} — Technical Brief & Attachments
          </CardTitle>
          <CardDescription>
            Answer the service-specific questions and attach any wireframes, RFPs, or brand assets
            to our private storage vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicServiceForm
            key={selectedService.id}
            fields={selectedService.fields}
            mode="submit"
            submitLabel="Submit Project Request"
            fileMap={fieldFiles}
            onFileFieldChange={handleFieldFilesChange}
            externalSubmitting={submitting}
            formError={submitError}
            onSubmitValues={handleSubmit}
            beforeSubmitContent={
              <div className="bg-background space-y-3 rounded-xl border border-dashed p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <Label
                      htmlFor="general-reference-files"
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Paperclip className="size-4" aria-hidden="true" />
                      <span>Reference Files & Specifications (Optional)</span>
                    </Label>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Private encrypted storage · Max 25 MB/file (PNG, JPG, WebP, PDF, TXT, CSV,
                      ZIP, DOCX, XLSX, PPTX).
                    </p>
                  </div>
                  <label
                    htmlFor="general-reference-files"
                    className="bg-card hover:bg-muted inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium"
                  >
                    <FileUp className="size-3.5" aria-hidden="true" />
                    <span>Add Files</span>
                    <input
                      id="general-reference-files"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.md,.csv,.zip,.docx,.xlsx,.pptx"
                      className="sr-only"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        handleAddReferenceFiles(picked);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                {referenceFiles.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {referenceFiles.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="bg-card flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                      >
                        <span className="truncate font-medium">
                          {file.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({formatFileSize(file.size)})
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setReferenceFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          aria-label={`Remove ${file.name}`}
                          className="h-6 px-2"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {Object.values(fieldFiles).some((arr) => arr.length > 0) ? (
                  <Alert>
                    <AlertDescription className="text-xs">
                      Queued {countTotalQueuedFiles(fieldFiles, referenceFiles)} file(s) total
                      across dynamic brief fields and general reference documents.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
