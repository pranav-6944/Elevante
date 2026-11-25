import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusIllustration } from "./StatusIllustration";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="bg-card/80 border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <StatusIllustration kind="empty" />
        <div className="max-w-md space-y-1.5">
          <h3 className="text-foreground text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
