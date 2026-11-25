"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CAPABILITIES, type CapabilityItem } from "@/lib/content/public-defaults";
import { cn } from "@/lib/utils";
import { CAPABILITY_ICON_MAP } from "@/components/marketing/CapabilitiesGrid";

interface CapabilityGroup {
  label: string;
  ids: readonly string[];
}

const CAPABILITY_GROUPS: readonly CapabilityGroup[] = [
  {
    label: "ENGINEERING & WEB",
    ids: ["website-development", "3d-web-experiences", "application-development"],
  },
  {
    label: "DATA & AI",
    ids: ["data-analytics", "excel-csv-automation", "ai-solutions"],
  },
  {
    label: "BRAND & DESIGN",
    ids: ["logo-design", "branding", "document-presentation-design"],
  },
];

function parseSelectedTitles(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ServiceAreaDropdown({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const prefersReducedMotion = useReducedMotion();

  const groupedItems = useMemo(() => {
    const byId = new Map<string, CapabilityItem>(CAPABILITIES.map((cap) => [cap.id, cap]));
    return CAPABILITY_GROUPS.map((group) => ({
      label: group.label,
      items: group.ids
        .map((capId) => byId.get(capId))
        .filter((item): item is CapabilityItem => Boolean(item)),
    }));
  }, []);

  const selectedTitles = useMemo(() => parseSelectedTitles(value), [value]);
  const primaryCapability = useMemo(
    () => CAPABILITIES.find((cap) => cap.title === selectedTitles[0]),
    [selectedTitles]
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggleSelection(title: string) {
    const exists = selectedTitles.includes(title);
    const next = exists
      ? selectedTitles.filter((item) => item !== title)
      : [...selectedTitles, title];
    onChange(next.join(", "));
  }

  const PrimaryIcon = primaryCapability ? CAPABILITY_ICON_MAP[primaryCapability.iconKey] : null;
  const triggerLabel =
    selectedTitles.length === 0
      ? "Select a capability (optional)"
      : selectedTitles.length === 1
        ? selectedTitles[0]
        : `${selectedTitles.length} selected: ${selectedTitles.join(", ")}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-full border px-4 text-left text-sm transition-all outline-none",
          open || selectedTitles.length > 0
            ? "border-emerald-500/60 bg-emerald-50/35 text-[#17264F] shadow-[0_0_20px_rgba(49,156,120,0.14)] ring-2 ring-emerald-500/15"
            : "border-[#cfe0db] bg-white/90 text-slate-600 hover:border-emerald-400/50 focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {PrimaryIcon ? (
            <PrimaryIcon className="text-brand-green size-4 shrink-0" aria-hidden="true" />
          ) : null}
          <span
            className={cn(
              "truncate",
              selectedTitles.length > 0 ? "font-medium text-[#17264F]" : "text-muted-foreground"
            )}
          >
            {triggerLabel}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5 text-slate-400">
          {!PrimaryIcon ? <LayoutGrid className="size-3.5" aria-hidden="true" /> : null}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              open && "text-brand-green rotate-180"
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Service capabilities"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: prefersReducedMotion ? 0.08 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-emerald-500/35 bg-white/95 shadow-[0_22px_50px_-10px_rgba(23,38,79,0.22),0_0_24px_rgba(49,156,120,0.12)] backdrop-blur-md"
          >
            <div className="max-h-76 space-y-2.5 overflow-y-auto p-3">
              {groupedItems.map((group, groupIdx) => (
                <div
                  key={group.label}
                  className={cn(groupIdx > 0 && "border-t border-[#e2eeea] pt-2.5")}
                >
                  <p className="px-2.5 pb-1.5 font-mono text-[10px] font-bold tracking-[0.14em] text-[#51727b] uppercase">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((cap) => {
                      const Icon = CAPABILITY_ICON_MAP[cap.iconKey];
                      const selected = selectedTitles.includes(cap.title);
                      return (
                        <button
                          key={cap.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => toggleSelection(cap.title)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-all",
                            selected
                              ? "bg-emerald-500/12 font-semibold text-[#17264F] shadow-[0_0_16px_rgba(49,156,120,0.12)] ring-1 ring-emerald-400/55"
                              : "text-slate-700 hover:bg-[#f1f8f5] hover:text-[#17264F]"
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <Icon
                              className={cn(
                                "size-4 shrink-0",
                                selected ? "text-brand-green" : "text-[#46636b]"
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{cap.title}</span>
                          </span>
                          {selected ? (
                            <Check
                              className="text-brand-green size-4 shrink-0"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#e2eeea] bg-[#f6fbf9] px-3.5 py-2 text-[11px] text-slate-500">
              <span>Select multiple or leave optional for general enquiry</span>
              {selectedTitles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="text-secondary shrink-0 font-semibold hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
