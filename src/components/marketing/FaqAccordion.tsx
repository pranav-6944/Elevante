"use client";

import { ChevronDown } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type { FaqEntry } from "@/lib/content/public-defaults";
import { cn } from "@/lib/utils";

export function FaqAccordion({
  items,
  defaultOpenFirst = true,
}: {
  items: FaqEntry[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      defaultValue={defaultOpenFirst ? items[0]?.id : undefined}
      className="flex w-full flex-col gap-3"
    >
      {items.map((faq, idx) => {
        const num = String(idx + 1).padStart(2, "0");
        return (
          <AccordionPrimitive.Item
            key={faq.id}
            value={faq.id}
            className={cn(
              "rounded-2xl border border-[#d6e5e0] bg-white/90 shadow-[0_6px_18px_-8px_rgba(23,38,79,0.08)] backdrop-blur-sm transition-all duration-200",
              "hover:border-emerald-400/50",
              "has-[[aria-expanded='true']]:border-emerald-400/70 has-[[aria-expanded='true']]:bg-gradient-to-br has-[[aria-expanded='true']]:from-white has-[[aria-expanded='true']]:via-[#f3fbf7] has-[[aria-expanded='true']]:to-[#e5f5ee] has-[[aria-expanded='true']]:shadow-[0_14px_34px_-12px_rgba(49,156,120,0.28)]"
            )}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group/trig focus-visible:ring-ring flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left transition-colors outline-none focus-visible:ring-2 sm:px-5 sm:py-4.5">
                <div className="flex items-start gap-3 sm:items-center sm:gap-3.5">
                  <span className="inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded-full bg-[#e5f2ee] px-2 font-mono text-[11px] font-bold text-[#245B70] transition-all duration-200 group-aria-expanded/trig:bg-gradient-to-r group-aria-expanded/trig:from-[#1cb883] group-aria-expanded/trig:to-[#239b87] group-aria-expanded/trig:text-white group-aria-expanded/trig:shadow-xs">
                    {num}
                  </span>
                  <span className="font-heading text-sm leading-snug font-semibold text-[#17264F] sm:text-base">
                    {faq.question}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#d6e5e0] bg-white/90 text-[#245B70] transition-all duration-200 group-hover/trig:border-emerald-400/60 group-aria-expanded/trig:rotate-180 group-aria-expanded/trig:border-transparent group-aria-expanded/trig:bg-gradient-to-br group-aria-expanded/trig:from-[#1cb883] group-aria-expanded/trig:to-[#239b87] group-aria-expanded/trig:text-white group-aria-expanded/trig:shadow-[0_4px_12px_rgba(49,156,120,0.35)]"
                >
                  <ChevronDown className="size-4" />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>

            <AccordionPrimitive.Content className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden">
              <div className="text-muted-foreground px-4 pt-0 pb-4 text-sm leading-relaxed sm:px-5 sm:pb-5 sm:pl-[4.15rem]">
                {faq.answer}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
