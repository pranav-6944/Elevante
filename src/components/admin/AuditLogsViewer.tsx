"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AuditLogRow } from "@/lib/services/admin.service";
import { formatShortDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuditLogsViewer({ logs }: { logs: AuditLogRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.actor_email ?? "").toLowerCase().includes(q)
    );
  }, [logs, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Immutable Compliance Trail
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Audit Logs</h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Filter action, entity, or actor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No audit records match the filter.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => (
            <Card key={log.id} className="bg-card">
              <CardContent className="space-y-2 p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {log.action}
                    </Badge>
                    <Badge variant="secondary">{log.entity_type}</Badge>
                    {log.entity_id ? (
                      <span className="text-muted-foreground font-mono">{log.entity_id}</span>
                    ) : null}
                  </div>
                  <span className="text-muted-foreground">{formatShortDate(log.created_at)}</span>
                </div>

                <p className="text-muted-foreground">
                  Actor: <strong className="text-foreground">{log.actor_email ?? "system"}</strong>
                  {log.ip_address ? ` · IP: ${log.ip_address}` : ""}
                </p>

                {log.new_values || log.old_values ? (
                  <pre className="bg-background text-muted-foreground overflow-x-auto rounded-lg border p-2.5 text-[11px]">
                    {JSON.stringify(
                      {
                        ...(log.old_values ? { old: log.old_values } : {}),
                        ...(log.new_values ? { new: log.new_values } : {}),
                      },
                      null,
                      2
                    )}
                  </pre>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
