"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Briefcase,
  FileArchive,
  FileText,
  FolderKanban,
  FolderTree,
  History,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import { resolveActiveNavHref } from "@/lib/motion/velocity-highlight";
import { cn } from "@/lib/utils";
import { VelocityHighlight } from "@/components/common/VelocityHighlight";
import { Badge } from "@/components/ui/badge";

const NAV_ICONS = {
  "layout-dashboard": LayoutDashboard,
  "plus-circle": PlusCircle,
  "folder-kanban": FolderKanban,
  "file-archive": FileArchive,
  bell: Bell,
  settings: Settings,
  inbox: Inbox,
  receipt: Receipt,
  users: Users,
  "folder-tree": FolderTree,
  layers: Layers,
  briefcase: Briefcase,
  "file-text": FileText,
  image: ImageIcon,
  "users-round": UsersRound,
  "bar-chart-3": BarChart3,
  history: History,
} as const;

export type NavIconName = keyof typeof NAV_ICONS;

export interface RouteNavItem {
  label: string;
  href: string;
  iconName: NavIconName;
  badgeCount?: number;
}

export function RouteVelocityNav({
  items,
  rootHref,
  ariaLabel,
  tone = "light",
}: {
  items: readonly RouteNavItem[];
  rootHref: string;
  ariaLabel: string;
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();
  const activeHref = resolveActiveNavHref(
    pathname,
    items.map((item) => item.href),
    rootHref
  );

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "border-t",
        tone === "dark" ? "bg-brand-navy/95 border-white/10" : "bg-background/70"
      )}
    >
      <VelocityHighlight
        activeKey={activeHref}
        axis="x"
        className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2"
        highlightClassName={
          tone === "dark"
            ? "rounded-lg bg-white/15 ring-1 ring-white/25"
            : "rounded-lg bg-accent ring-1 ring-brand-teal/20"
        }
      >
        {items.map((item) => {
          const Icon = NAV_ICONS[item.iconName];
          const active = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-highlight-key={item.href}
              data-active={active ? "true" : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                tone === "dark"
                  ? active
                    ? "text-white [[data-vh-container]:not([data-hl-ready='true'])_&]:bg-white/15"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  : active
                    ? "text-foreground [[data-vh-container]:not([data-hl-ready='true'])_&]:bg-accent font-semibold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{item.label}</span>
              {item.badgeCount && item.badgeCount > 0 ? (
                <Badge className="bg-brand-green ml-0.5 h-4 min-w-4 px-1 text-[10px] text-white">
                  {item.badgeCount}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </VelocityHighlight>
    </nav>
  );
}
