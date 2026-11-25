"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateAdminProjectAction } from "@/actions/admin-ops.actions";
import { PROJECT_PRIORITIES, PROJECT_STATUS_META } from "@/lib/validations/projects";
import type { UserRole } from "@/types";
import type { ProjectPriority, ProjectStatus } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdminProjectControls({
  projectId,
  initialStatus,
  initialPriority,
  initialAssignedTo,
  canReassign,
  staffOptions,
}: {
  projectId: string;
  initialStatus: ProjectStatus;
  initialPriority: ProjectPriority;
  initialAssignedTo: string | null;
  canReassign: boolean;
  staffOptions: Array<{ id: string; fullName: string; roleSlug: UserRole }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ProjectStatus>(initialStatus);
  const [priority, setPriority] = useState<ProjectPriority>(initialPriority);
  const [assignedTo, setAssignedTo] = useState<string>(initialAssignedTo ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const res = await updateAdminProjectAction({
      projectId,
      status,
      priority,
      assignedTo,
      note,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setNote("");
    setFeedback({ type: "success", message: "Project status and assignment updated." });
    router.refresh();
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Workflow Controls</CardTitle>
        <CardDescription>
          Transition project status, priority, and team ownership (audit-logged + client notified).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedback ? (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="mb-4">
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="adm-proj-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger id="adm-proj-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {PROJECT_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adm-proj-priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
                <SelectTrigger id="adm-proj-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adm-proj-assignee">Assigned Lead</Label>
              <Select
                value={assignedTo || "_unassigned"}
                disabled={!canReassign}
                onValueChange={(v) => setAssignedTo(v === "_unassigned" ? "" : v)}
              >
                <SelectTrigger id="adm-proj-assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_unassigned">Unassigned</SelectItem>
                  {staffOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName} ({s.roleSlug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adm-proj-note">Status History Note (Optional)</Label>
            <Textarea
              id="adm-proj-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain status change for audit trail and timeline..."
            />
          </div>

          <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
            <Save className="size-4" aria-hidden="true" />
            <span>{busy ? "Saving..." : "Update Project"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

