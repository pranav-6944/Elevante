"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { AdminProjectListItem } from "@/lib/services/admin.service";
import { formatShortDate } from "@/lib/utils/format";
import { PROJECT_STATUS_META } from "@/lib/validations/projects";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "@/types/database";

export function AdminProjectsManager({ projects }: { projects: AdminProjectListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.project_code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [projects, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Delivery Pipeline
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Project Management</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Code, title, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | ProjectStatus)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {PROJECT_STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No customer projects match the current filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="bg-card hover:border-secondary flex flex-col justify-between gap-4 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-secondary font-mono font-semibold">
                    {project.project_code}
                  </span>
                  <Badge variant="outline">{project.serviceTitle}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {project.priority}
                  </Badge>
                </div>
                <p className="text-foreground truncate font-semibold">{project.title}</p>
                <p className="text-muted-foreground text-xs">
                  Client: {project.customerName} ({project.customerEmail})
                  {project.assigneeName ? ` · Assigned: ${project.assigneeName}` : " · Unassigned"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  {formatShortDate(project.submitted_at)}
                </span>
                <ProjectStatusBadge status={project.status} />
                <ArrowRight className="text-muted-foreground size-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

