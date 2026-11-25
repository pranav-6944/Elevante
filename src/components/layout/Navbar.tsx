"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border/80 bg-card/90 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 sm:h-18">
        <Link
          href="/"
          className="focus-visible:outline-ring inline-flex shrink-0 items-center rounded-md focus-visible:outline-2"
          aria-label="ELEVANTE Home"
        >
          <BrandLogo variant="horizontal" className="h-8 w-auto sm:h-9" priority />
        </Link>

        <nav aria-label="Primary Navigation" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Button asChild variant="ghost" size="default">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            size="default"
            className="bg-brand-gradient px-4 text-white hover:opacity-95"
          >
            <Link href="/contact" className="inline-flex items-center gap-1.5">
              <span>Start a Project</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82vw] max-w-sm">
              <SheetHeader className="border-b pb-4 text-left">
                <SheetTitle className="flex items-center">
                  <BrandLogo variant="horizontal" className="h-8 w-auto" />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Mobile site navigation links
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile Navigation" className="flex flex-col gap-1.5 px-4 pt-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === "/"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  Home
                </Link>
                {NAV_LINKS.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-gradient w-full text-white hover:opacity-95"
                  >
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Start a Project
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
