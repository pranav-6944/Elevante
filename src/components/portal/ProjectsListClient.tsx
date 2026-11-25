"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { CustomerProjectSummary } from "@/lib/services/portal.service";
import { formatShortDate } from "@/lib/utils/format";
import { PROJECT_STATUS_META } from "@/lib/validations/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectStatusBadge } from "@/components/portal/ProjectStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "@/types/database";

export function ProjectsListClient({ projects }: { projects: CustomerProjectSummary[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.project_code.toLowerCase().includes(q) ||
        p.serviceTitle.toLowerCase().includes(q)
      );
    });
  }, [projects, query, statusFilter]);

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No Projects Submitted Yet"
        description="Start a new project request from any published ELEVANTE capability to receive a tailored quotation and track progress."
        action={
          <Button asChild className="bg-brand-gradient text-white">
            <Link href="/dashboard/projects/new">Start a Project</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, title, or service..."
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | ProjectStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map((statusKey) => (
                <SelectItem key={statusKey} value={statusKey}>
                  {PROJECT_STATUS_META[statusKey].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
          No projects match your current filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-card hover:border-secondary/60 flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-colors sm:flex-row sm:items-center"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-secondary font-mono font-semibold">
                    {project.project_code}
                  </span>
                  <Badge variant="outline">{project.serviceTitle}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {project.priority} priority
                  </Badge>
                </div>
                <h2 className="text-foreground truncate text-lg font-semibold">{project.title}</h2>
                <p className="text-muted-foreground line-clamp-1 text-sm">{project.summary}</p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <div className="text-right text-xs">
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="text-foreground font-medium">
                    {formatShortDate(project.submitted_at)}
                  </p>
                </div>
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
