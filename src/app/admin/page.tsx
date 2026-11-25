import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, FileText, FolderTree, Image as ImageIcon, Layers } from "lucide-react";
import { requireRoleOrRedirect } from "@/lib/auth/guards";
import { ADMIN_PANEL_ROLES } from "@/lib/auth/rbac";
import { buildMetadata } from "@/lib/seo/metadata";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "ELEVANTE protected administrative operations workspace.",
  path: "/admin",
  noIndex: true,
});

const ADMIN_MODULES = [
  {
    title: "Service Categories",
    description: "Create, publish, and order service taxonomy.",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Services & Form Builder",
    description: "Configure services, deliverables, pricing hints, and custom brief forms.",
    href: "/admin/services",
    icon: Layers,
  },
  {
    title: "Content & FAQs",
    description: "Update homepage headings, JSON blocks, SEO fields, and published FAQs.",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Media Library",
    description: "Upload images, videos, and documents into public Storage.",
    href: "/admin/media",
    icon: ImageIcon,
  },
];

async function AdminOverviewContent() {
  const profile = await requireRoleOrRedirect(ADMIN_PANEL_ROLES, {
    nextPath: "/admin",
    unauthorizedRedirect: "/dashboard",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Role-Protected Operations
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            ELEVANTE Admin Workspace
          </h1>
        </div>
        <Badge variant="secondary" className="capitalize">
          Verified Role: {profile.role}
        </Badge>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {ADMIN_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="group">
              <Card className="bg-card hover:border-secondary h-full transition-all hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="text-muted-foreground group-hover:text-foreground size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminOverviewContent />
    </Suspense>
  );
}
