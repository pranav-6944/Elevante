import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <header className="bg-card/90 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo variant="horizontal" className="h-8 w-auto" priority />
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Back to Website</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {children}
        <p className="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-xs">
          <ShieldCheck className="text-brand-green size-3.5" aria-hidden="true" />
          <span>Secured with Supabase Auth &amp; Server-Side Session Verification</span>
        </p>
      </main>
    </div>
  );
}
