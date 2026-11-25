import { Suspense } from "react";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCustomerFilesData } from "@/lib/services/portal.service";
import { formatFileSize, formatShortDate } from "@/lib/utils/format";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "My Files",
  description: "Access your private project reference files and released deliverables.",
  path: "/dashboard/files",
  noIndex: true,
});

async function FilesPageContent() {
  const profile = await requireAuthOrRedirect("/dashboard/files");
  const files = await getCustomerFilesData(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Encrypted Storage Vault
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          My Files & Deliverables
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Downloads use short-lived private signed URLs scoped exclusively to your projects.
        </p>
      </div>

      {files.length === 0 ? (
        <EmptyState
          title="No Files Available Yet"
          description="Reference documents you upload with project requests and deliverables released by ELEVANTE will appear here."
          action={
            <Button asChild className="bg-brand-gradient text-white">
              <Link href="/dashboard/projects/new">Start a Project</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {files.map((item) => (
            <Card key={`${item.kind}-${item.id}`} className="bg-card">
              <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant={item.kind === "deliverable" ? "default" : "outline"}
                      className={item.kind === "deliverable" ? "bg-brand-green text-white" : ""}
                    >
                      {item.kind === "deliverable" ? "Deliverable" : "Reference"}
                    </Badge>
                    <span className="text-secondary font-mono font-semibold">
                      {item.projectCode}
                    </span>
                    <span className="text-muted-foreground truncate">{item.projectTitle}</span>
                  </div>
                  <p className="text-foreground truncate font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.originalFilename} · {formatFileSize(item.fileSize)} ·{" "}
                    {formatShortDate(item.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link
                      href={`/dashboard/projects/${item.projectId}`}
                      className="inline-flex items-center gap-1"
                    >
                      <span>Project</span>
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`/api/projects/files/${item.id}/download?kind=${item.kind}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      <span>Download</span>
                    </a>
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

export default function CustomerFilesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <FilesPageContent />
    </Suspense>
  );
}
