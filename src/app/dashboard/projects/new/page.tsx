import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPortalServicesForPicker } from "@/lib/services/portal.service";
import { EmptyState } from "@/components/common/EmptyState";
import { StartProjectForm } from "@/components/portal/StartProjectForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Start a Project",
  description: "Submit a structured service brief and reference files to ELEVANTE.",
  path: "/dashboard/projects/new",
  noIndex: true,
});

async function StartProjectContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: requestedSlug } = await searchParams;
  const nextPath = requestedSlug
    ? `/dashboard/projects/new?service=${encodeURIComponent(requestedSlug)}`
    : "/dashboard/projects/new";

  await requireAuthOrRedirect(nextPath);
  const services = await getPortalServicesForPicker();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Start a New Project</h1>
        <p className="text-muted-foreground text-sm">
          Your answers are captured as a point-in-time brief snapshot so your requirements remain
          unchanged during review and quotation.
        </p>
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No Published Services Available Yet"
          description="Services are managed in the Admin Panel. Once services are published in your database, you can start a project request directly here."
          action={
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-brand-gradient text-white">
                <Link href="/contact">Send a General Enquiry</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Portal</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <StartProjectForm services={services} initialSlug={requestedSlug} />
      )}
    </div>
  );
}

export default function StartProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-2xl" />}>
      <StartProjectContent searchParams={searchParams} />
    </Suspense>
  );
}
