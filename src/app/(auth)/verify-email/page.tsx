import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Verify Email",
  description: "Verify your email address to activate your ELEVANTE account.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full max-w-md rounded-2xl" />}>
      <VerifyEmailCard />
    </Suspense>
  );
}
