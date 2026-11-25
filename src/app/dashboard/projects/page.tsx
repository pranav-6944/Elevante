import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCustomerProjects } from "@/lib/services/portal.service";
import { ProjectsListClient } from "@/components/portal/ProjectsListClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "My Projects",
  description: "Track all submitted project requests, statuses, and deliverables.",
  path: "/dashboard/projects",
  noIndex: true,
});

async function ProjectsPageContent() {
  const profile = await requireAuthOrRedirect("/dashboard/projects");
  const projects = await getCustomerProjects(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Project Workspace
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Filter and inspect your active briefs, quotations, reference files, and deliverables.
          </p>
        </div>

        <Button asChild className="bg-brand-gradient text-white">
          <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            <span>Start a Project</span>
          </Link>
        </Button>
      </div>

      <ProjectsListClient projects={projects} />
    </div>
  );
}

export default function CustomerProjectsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <ProjectsPageContent />
    </Suspense>
  );
}
