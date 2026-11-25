import { Suspense } from "react";
import Link from "next/link";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Customer Portal",
  description: "Authenticated ELEVANTE customer workspace.",
  path: "/dashboard",
  noIndex: true,
});

async function DashboardOverviewContent() {
  const profile = await requireAuthOrRedirect("/dashboard");

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Customer Portal
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Welcome back, {profile.fullName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Role: {profile.role}</Badge>
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">Account Settings</Link>
          </Button>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Authenticated Session Verified</CardTitle>
          <CardDescription>
            Your account is guarded by Supabase SSR JWT validation, PostgreSQL RLS, and Next.js
            server authorization.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Account Email</p>
            <p className="text-foreground mt-1 font-medium">{profile.email}</p>
          </div>
          <div className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Company</p>
            <p className="text-foreground mt-1 font-medium">{profile.companyName || "Not set"}</p>
          </div>
          <div className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Account Status</p>
            <p className="text-brand-green mt-1 font-medium">
              {profile.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </CardContent>
      </Card>

      <EmptyState
        title="Full Customer Project Portal Arrives in Phase 6"
        description="Dynamic project request submission, reference file uploads, quotations, messaging, and deliverables will activate in Phase 6 once Dynamic Services (Phase 5) is complete."
        action={
          <Button asChild className="bg-brand-gradient text-white">
            <Link href="/services">Explore Capabilities</Link>
          </Button>
        }
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <DashboardOverviewContent />
    </Suspense>
  );
}
