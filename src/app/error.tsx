"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logStructuredError } from "@/lib/observability/error-monitor";
import { Button } from "@/components/ui/button";
import { StatusIllustration } from "@/components/common/StatusIllustration";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  useEffect(() => {
    logStructuredError("app.segment_boundary", error, { ...(digest ? { digest } : {}) });
  }, [error, digest]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-card flex max-w-lg flex-col items-center gap-6 rounded-2xl border p-8 shadow-sm sm:p-10">
        <StatusIllustration kind="server-error" />
        <div className="space-y-2">
          <p className="text-destructive text-xs font-semibold tracking-widest uppercase">
            Unexpected Error
          </p>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Something interrupted this request
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Please try reloading this section. If the issue persists, return to the home page.
          </p>
          {digest ? (
            <p className="text-muted-foreground font-mono text-xs">Reference ID: {digest}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => retry()} className="bg-brand-gradient text-white">
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
