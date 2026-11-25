import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_META } from "@/lib/validations/projects";
import type { ProjectStatus } from "@/types/database";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.toneClass}>
      {meta.label}
    </Badge>
  );
}
