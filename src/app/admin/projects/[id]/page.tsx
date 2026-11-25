import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Receipt } from "lucide-react";
import { z } from "zod";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES, isAdminRole } from "@/lib/auth/rbac";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminProjectDetail } from "@/lib/services/admin.service";
import { formatFileSize, formatMoneyMinor, formatShortDate } from "@/lib/utils/format";
import { AdminProjectControls } from "@/components/admin/AdminProjectControls";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Project Detail",
  description: "Inspect brief responses, attachments, quotations, and status workflow.",
  path: "/admin/projects",
  noIndex: true,
});

const uuidSchema = z.string().uuid();

async function AdminProjectDetailBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: `/admin/projects/${id}`,
    unauthorizedRedirect: "/dashboard",
  });

  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const detail = await getAdminProjectDetail(actor, parsedId.data);
  if (!detail) notFound();

  const fullAdmin = isAdminRole(actor.role);
  const {
    project,
    serviceTitle,
    customer,
    responses,
    files,
    quotations,
    statusHistory,
    staffOptions,
  } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/admin/projects"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to Projects</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-secondary font-mono text-xs font-semibold">
              {project.project_code}
            </span>
            <ProjectStatusBadge status={project.status} />
            <Badge variant="outline">{serviceTitle}</Badge>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {project.title}
          </h1>
        </div>

        {fullAdmin ? (
          <Button asChild className="bg-brand-gradient text-white">
            <Link
              href={`/admin/quotations?project=${project.id}`}
              className="inline-flex items-center gap-1.5"
            >
              <Receipt className="size-4" aria-hidden="true" />
              <span>Create Quotation</span>
            </Link>
          </Button>
        ) : null}
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Customer & Summary</CardTitle>
          <CardDescription>
            {customer?.full_name ?? "Customer"} · {customer?.email}
            {customer?.company_name ? ` · ${customer.company_name}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-foreground leading-relaxed">{project.summary}</p>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            <span>Submitted: {formatShortDate(project.submitted_at)}</span>
            <span>Deadline: {formatShortDate(project.desired_deadline)}</span>
            <span>Budget: {project.budget_range || "Not specified"}</span>
          </div>
        </CardContent>
      </Card>

      <AdminProjectControls
        projectId={project.id}
        initialStatus={project.status}
        initialPriority={project.priority}
        initialAssignedTo={project.assigned_to}
        canReassign={fullAdmin}
        staffOptions={staffOptions}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-base">Brief Snapshot ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {responses.length === 0 ? (
              <p className="text-muted-foreground">No custom service brief responses.</p>
            ) : (
              responses.map((resp) => (
                <div key={resp.id} className="bg-background rounded-xl border p-3">
                  <p className="text-muted-foreground text-xs">{resp.field_label}</p>
                  <p className="text-foreground mt-1 whitespace-pre-wrap">
                    {Array.isArray(resp.response_value)
                      ? resp.response_value.join(", ")
                      : typeof resp.response_value === "boolean"
                        ? resp.response_value
                          ? "Yes"
                          : "No"
                        : String(resp.response_value ?? "Not provided")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Reference Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.length === 0 ? (
                <p className="text-muted-foreground text-sm">No files attached.</p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-background flex items-center justify-between gap-2 rounded-xl border p-3 text-xs"
                  >
                    <span className="truncate font-medium">
                      {file.original_filename} ({formatFileSize(file.file_size)})
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={`/api/projects/files/${file.id}/download?kind=reference`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                      >
                        <Download className="size-3.5" aria-hidden="true" />
                        <span>Download</span>
                      </a>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Quotations ({quotations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {quotations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No quotations issued yet.</p>
              ) : (
                quotations.map((q) => (
                  <div
                    key={q.id}
                    className="bg-background flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {q.quote_number} (v{q.version}) — {q.title}
                      </p>
                      <p className="text-muted-foreground capitalize">{q.status}</p>
                    </div>
                    <span className="font-semibold">
                      {formatMoneyMinor(q.total_minor, q.currency)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Status History ({statusHistory.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {statusHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No status transitions recorded.</p>
              ) : (
                statusHistory.map((h) => (
                  <div key={h.id} className="bg-background rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <ProjectStatusBadge status={h.to_status} />
                      <span className="text-muted-foreground">{formatShortDate(h.created_at)}</span>
                    </div>
                    {h.note ? <p className="text-muted-foreground mt-1.5">{h.note}</p> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-2xl" />}>
      <AdminProjectDetailBody params={params} />
    </Suspense>
  );
}
