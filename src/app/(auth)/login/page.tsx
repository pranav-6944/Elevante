import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your ELEVANTE Client Portal or Admin account.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-md rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  );
}

