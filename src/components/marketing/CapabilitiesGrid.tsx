import {
  BarChart3,
  Box,
  FileText,
  Globe,
  Layers,
  PenTool,
  Smartphone,
  Sparkles,
  Table2,
  type LucideIcon,
} from "lucide-react";
import type { CapabilityItem } from "@/lib/content/public-defaults";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CAPABILITY_ICON_MAP: Record<CapabilityItem["iconKey"], LucideIcon> = {
  globe: Globe,
  box: Box,
  smartphone: Smartphone,
  "bar-chart": BarChart3,
  table: Table2,
  sparkles: Sparkles,
  "pen-tool": PenTool,
  layers: Layers,
  "file-text": FileText,
};

export function CapabilitiesGrid({ items }: { items: CapabilityItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = CAPABILITY_ICON_MAP[item.iconKey];
        return (
          <Card
            key={item.id}
            className="group border-border/80 bg-card hover:border-secondary/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="bg-accent text-primary group-hover:bg-brand-gradient flex size-10 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <Badge variant="outline" className="text-secondary text-[11px] font-medium">
                  {item.category}
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
