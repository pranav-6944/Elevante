import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusIllustration } from "@/components/common/StatusIllustration";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-card flex max-w-lg flex-col items-center gap-6 rounded-2xl border p-8 shadow-sm sm:p-10">
        <StatusIllustration kind="not-found" />
        <div className="space-y-2">
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            404 — Page Not Found
          </p>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            We couldn&apos;t find that page
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The resource may have been moved, unpublished, or the link may be incorrect.
          </p>
        </div>
        <Button asChild size="lg" className="bg-brand-gradient text-white hover:opacity-95">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </main>
  );
}
