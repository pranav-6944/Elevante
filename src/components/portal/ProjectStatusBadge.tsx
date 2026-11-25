import { PROJECT_STATUS_META } from "@/lib/validations/projects";
import { ScrambleText } from "@/components/common/ScrambleText";
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/database";

export function ProjectStatusBadge({
  status,
  animateOnMount = false,
}: {
  status: ProjectStatus;
  animateOnMount?: boolean;
}) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.toneClass}>
      <ScrambleText
        text={meta.label}
        trigger={animateOnMount ? "inView" : "change"}
        durationMs={380}
      />
    </Badge>
  );
}
