"use client";

import type { FaqEntry } from "@/lib/content/public-defaults";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion type="single" collapsible className="bg-card w-full rounded-2xl border px-6">
      {items.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-foreground py-4 text-left text-base font-medium">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
