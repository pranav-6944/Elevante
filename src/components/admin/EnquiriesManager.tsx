"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Search } from "lucide-react";
import { updateEnquiryAction } from "@/actions/admin-ops.actions";
import type { EnquiryRow } from "@/lib/services/admin.service";
import { formatShortDate } from "@/lib/utils/format";
import { ENQUIRY_STATUSES } from "@/lib/validations/admin";
import type { UserRole } from "@/types";
import type { EnquiryStatus } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function EnquiriesManager({
  enquiries,
  staffOptions,
}: {
  enquiries: EnquiryRow[];
  staffOptions: Array<{ id: string; fullName: string; roleSlug: UserRole }>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EnquiryStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(enquiries[0]?.id ?? null);

  const selected = useMemo(
    () => enquiries.find((e) => e.id === selectedId) ?? null,
    [enquiries, selectedId]
  );

  const [status, setStatus] = useState<EnquiryStatus>(selected?.status ?? "new");
  const [assignedTo, setAssignedTo] = useState<string>(selected?.assigned_to ?? "");
  const [internalNotes, setInternalNotes] = useState<string>(selected?.internal_notes ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function selectEnquiry(item: EnquiryRow) {
    setSelectedId(item.id);
    setStatus(item.status);
    setAssignedTo(item.assigned_to ?? "");
    setInternalNotes(item.internal_notes ?? "");
    setFeedback(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    });
  }, [enquiries, search, statusFilter]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setFeedback(null);

    const res = await updateEnquiryAction({
      id: selected.id,
      status,
      assignedTo,
      internalNotes,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: "Enquiry updated and audit-logged." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Lead Triage
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Enquiries</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | EnquiryStatus)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ENQUIRY_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No enquiries match the active filter.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-2.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectEnquiry(item)}
                className={`bg-card w-full rounded-2xl border p-4 text-left transition-colors ${
                  selected?.id === item.id
                    ? "border-secondary ring-secondary/20 ring-2"
                    : "hover:border-secondary/50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Badge variant="outline" className="capitalize">
                    {item.status}
                  </Badge>
                  <span className="text-muted-foreground">{formatShortDate(item.created_at)}</span>
                </div>
                <p className="text-foreground mt-1.5 font-semibold">{item.subject}</p>
                <p className="text-muted-foreground text-xs">
                  {item.name} ({item.email}){item.company ? ` · ${item.company}` : ""}
                </p>
              </button>
            ))}
          </div>

          {selected ? (
            <Card className="bg-card h-fit">
              <CardHeader>
                <CardTitle className="text-lg">{selected.subject}</CardTitle>
                <CardDescription>
                  From {selected.name} &lt;{selected.email}&gt;
                  {selected.phone ? ` · ${selected.phone}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-background space-y-2 rounded-xl border p-4 text-sm">
                  {selected.service_interest ? (
                    <Badge variant="secondary">{selected.service_interest}</Badge>
                  ) : null}
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                {feedback ? (
                  <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{feedback.message}</AlertDescription>
                  </Alert>
                ) : null}

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="enq-status">Status</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as EnquiryStatus)}>
                        <SelectTrigger id="enq-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENQUIRY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="enq-assignee">Assignee</Label>
                      <Select
                        value={assignedTo || "_unassigned"}
                        onValueChange={(v) => setAssignedTo(v === "_unassigned" ? "" : v)}
                      >
                        <SelectTrigger id="enq-assignee">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_unassigned">Unassigned</SelectItem>
                          {staffOptions.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.fullName} ({u.roleSlug})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enq-notes">Internal Notes</Label>
                    <Textarea
                      id="enq-notes"
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Follow-up log, qualification notes..."
                    />
                  </div>

                  <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                    <Save className="size-4" aria-hidden="true" />
                    <span>{busy ? "Saving..." : "Save Enquiry"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
