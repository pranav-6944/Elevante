import { Suspense } from "react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCustomerNotifications } from "@/lib/services/portal.service";
import { NotificationsListClient } from "@/components/portal/NotificationsListClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Notifications",
  description: "Stay updated on project reviews, quotations, and released deliverables.",
  path: "/dashboard/notifications",
  noIndex: true,
});

async function NotificationsPageContent() {
  const profile = await requireAuthOrRedirect("/dashboard/notifications");
  const notifications = await getCustomerNotifications(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Activity Feed
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Important updates about your submitted briefs, files, and project milestones.
        </p>
      </div>

      <NotificationsListClient notifications={notifications} />
    </div>
  );
}

export default function CustomerNotificationsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <NotificationsPageContent />
    </Suspense>
  );
}
