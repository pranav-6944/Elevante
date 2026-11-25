import { FOUNDERS } from "@/lib/content/public-defaults";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FoundersSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {FOUNDERS.map((founder) => (
        <Card key={founder.name} className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div
              className="bg-brand-gradient font-heading flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-xs"
              aria-hidden="true"
            >
              {founder.initials}
            </div>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-[11px]">
                {founder.role}
              </Badge>
              <CardTitle className="text-xl">{founder.name}</CardTitle>
              <p className="text-secondary text-xs font-medium">{founder.focus}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">{founder.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
