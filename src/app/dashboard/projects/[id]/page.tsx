import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  FolderOpen,
  MessageSquare,
  Receipt,
} from "lucide-react";
import { z } from "zod";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCustomerProjectDetail } from "@/lib/services/portal.service";
import { formatFileSize, formatMoneyMinor, formatShortDate } from "@/lib/utils/format";
import { PROJECT_STATUS_META } from "@/lib/validations/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectAttachmentUploader } from "@/components/portal/ProjectAttachmentUploader";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { QuotationResponseActions } from "@/components/portal/QuotationResponseActions";
import { ProjectMessagesPanel } from "@/components/workflow/ProjectMessagesPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Json } from "@/types/database";

export const metadata = buildMetadata({
  title: "Project Details",
  description: "Inspect submitted brief snapshot, files, timeline, quotations, and deliverables.",
  path: "/dashboard/projects",
  noIndex: true,
});

const uuidSchema = z.string().uuid();

function formatResponseValue(value: Json): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((v) => String(v)).join(", ") : "None";
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

async function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = uuidSchema.safeParse(id);
  const profile = await requireAuthOrRedirect(`/dashboard/projects/${id}`);

  if (!parsedId.success) {
    notFound();
  }

  const detail = await getCustomerProjectDetail(profile.id, parsedId.data);
  if (!detail) {
    notFound();
  }

  const { project, responses, statusHistory, files, deliverables, quotations, messages } = detail;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/dashboard/projects"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>All My Projects</span>
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-secondary font-mono text-xs font-semibold">
                {project.project_code}
              </span>
              <ProjectStatusBadge status={project.status} />
              <Badge variant="outline" className="capitalize">
                {project.priority} priority
              </Badge>
              {project.serviceSlug ? (
                <Link href={`/services/${project.serviceSlug}`}>
                  <Badge variant="secondary">{project.serviceTitle}</Badge>
                </Link>
              ) : (
                <Badge variant="secondary">{project.serviceTitle}</Badge>
              )}
            </div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {project.title}
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground max-w-4xl text-sm leading-relaxed">{project.summary}</p>

        <div className="grid gap-3 pt-1 text-xs sm:grid-cols-3">
          <div className="bg-card rounded-xl border p-3.5">
            <p className="text-muted-foreground">Submitted On</p>
            <p className="text-foreground mt-1 text-sm font-medium">
              {formatShortDate(project.submitted_at)}
            </p>
          </div>
          <div className="bg-card rounded-xl border p-3.5">
            <p className="text-muted-foreground">Target Date</p>
            <p className="text-foreground mt-1 text-sm font-medium">
              {formatShortDate(project.desired_deadline)}
            </p>
          </div>
          <div className="bg-card rounded-xl border p-3.5">
            <p className="text-muted-foreground">Expected Budget</p>
            <p className="text-foreground mt-1 text-sm font-medium">
              {project.budget_range || "Custom Quotation"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="brief" className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-1">
          <TabsTrigger value="brief" className="gap-1.5">
            <FileText className="size-3.5" aria-hidden="true" />
            Brief Snapshot ({responses.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5">
            <FolderOpen className="size-3.5" aria-hidden="true" />
            Files & Deliverables ({files.length + deliverables.length})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            Timeline ({statusHistory.length})
          </TabsTrigger>
          <TabsTrigger value="quotations" className="gap-1.5">
            <Receipt className="size-3.5" aria-hidden="true" />
            Quotations ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Immutable Brief Snapshot</CardTitle>
              <CardDescription>
                Captured at submission time so future service template updates do not alter your
                submitted specifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No additional custom service questions were included in this brief.
                </p>
              ) : (
                <dl className="grid gap-4 sm:grid-cols-2">
                  {responses.map((item) => (
                    <div key={item.id} className="bg-background rounded-xl border p-4">
                      <dt className="text-muted-foreground text-xs font-medium">
                        {item.field_label}
                      </dt>
                      <dd className="text-foreground mt-1.5 text-sm whitespace-pre-wrap">
                        {formatResponseValue(item.response_value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <ProjectAttachmentUploader projectId={project.id} />

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Reference Attachments</CardTitle>
              <CardDescription>
                Files uploaded with your project request inside private storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No reference attachments uploaded for this project yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="bg-background flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {file.original_filename}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatFileSize(file.file_size)} · Uploaded{" "}
                          {formatShortDate(file.created_at)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={`/api/projects/files/${file.id}/download?kind=reference`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <Download className="size-3.5" aria-hidden="true" />
                          <span>Download</span>
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Project Deliverables</CardTitle>
              <CardDescription>
                Approved deliverables released by the ELEVANTE team for your review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No deliverables have been released for this project yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {deliverables.map((item) => (
                    <div
                      key={item.id}
                      className="bg-background flex flex-col justify-between gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {item.title}
                          </p>
                          <Badge variant="outline">{item.version_label}</Badge>
                        </div>
                        {item.description ? (
                          <p className="text-muted-foreground text-xs">{item.description}</p>
                        ) : null}
                        <p className="text-muted-foreground text-xs">
                          {item.original_filename} · {formatFileSize(item.file_size)}
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-brand-gradient text-white">
                        <a
                          href={`/api/projects/files/${item.id}/download?kind=deliverable`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <Download className="size-3.5" aria-hidden="true" />
                          <span>Download</span>
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Status Timeline</CardTitle>
              <CardDescription>Tracked milestones from submission to completion.</CardDescription>
            </CardHeader>
            <CardContent>
              {statusHistory.length === 0 ? (
                <div className="bg-background rounded-xl border p-4 text-sm">
                  Current status: <strong>{PROJECT_STATUS_META[project.status].label}</strong>{" "}
                  (Submitted {formatShortDate(project.submitted_at)})
                </div>
              ) : (
                <ol className="space-y-3">
                  {statusHistory.map((entry) => (
                    <li key={entry.id} className="bg-background rounded-xl border p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ProjectStatusBadge status={entry.to_status} />
                          {entry.from_status ? (
                            <span className="text-muted-foreground text-xs">
                              from {PROJECT_STATUS_META[entry.from_status].label}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatShortDate(entry.created_at)}
                        </span>
                      </div>
                      {entry.note ? (
                        <p className="text-muted-foreground mt-2 text-xs">{entry.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          {quotations.length === 0 ? (
            <EmptyState
              title="No Quotations Issued Yet"
              description="Once our engineering lead reviews your brief and requirements, a structured quotation with transparent line items will appear here."
            />
          ) : (
            <div className="space-y-4">
              {quotations.map((quote) => (
                <Card key={quote.id} className="bg-card">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-secondary font-mono text-xs font-semibold">
                          {quote.quote_number} · v{quote.version}
                        </span>
                        <CardTitle className="mt-1 text-lg">{quote.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {quote.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription>{quote.scope_summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quote.items.length > 0 ? (
                      <div className="bg-background divide-y rounded-xl border text-sm">
                        {quote.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between gap-2 p-3 sm:flex-row sm:items-center"
                          >
                            <div>
                              <p className="font-medium">{item.title}</p>
                              {item.description ? (
                                <p className="text-muted-foreground text-xs">{item.description}</p>
                              ) : null}
                            </div>
                            <p className="text-foreground shrink-0 font-semibold">
                              {item.quantity} ×{" "}
                              {formatMoneyMinor(item.unit_price_minor, quote.currency)} ={" "}
                              {formatMoneyMinor(item.line_total_minor, quote.currency)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-3 text-sm">
                      <div className="text-muted-foreground space-x-4 text-xs">
                        {quote.estimated_duration ? (
                          <span>Duration: {quote.estimated_duration}</span>
                        ) : null}
                        {quote.valid_until ? (
                          <span>Valid Until: {formatShortDate(quote.valid_until)}</span>
                        ) : null}
                      </div>
                      <p className="text-foreground text-base font-bold">
                        Total: {formatMoneyMinor(quote.total_minor, quote.currency)}
                      </p>
                    </div>

                    <QuotationResponseActions
                      quotationId={quote.id}
                      status={quote.status}
                      existingNote={quote.customer_response_note}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Project Communication</CardTitle>
              <CardDescription>
                Message the ELEVANTE team directly or reply to clarification requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectMessagesPanel
                projectId={project.id}
                customerId={project.customer_id}
                projectStatus={project.status}
                mode="customer"
                messages={messages}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CustomerProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-2xl" />}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}
