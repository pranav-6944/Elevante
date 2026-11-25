import { Suspense } from "react";
import { requireAuthOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Account Settings",
  description: "Manage your ELEVANTE profile and security settings.",
  path: "/dashboard/settings",
  noIndex: true,
});

async function AccountSettingsContent() {
  const profile = await requireAuthOrRedirect("/dashboard/settings");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Account Security
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Account Settings</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProfileSettingsForm
          email={profile.email}
          initialValues={{
            fullName: profile.fullName,
            phone: profile.phone ?? "",
            companyName: profile.companyName ?? "",
            jobTitle: profile.jobTitle ?? "",
          }}
        />
        <ResetPasswordForm title="Change Password" />
      </div>
    </div>
  );
}

export default function DashboardSettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AccountSettingsContent />
    </Suspense>
  );
}
