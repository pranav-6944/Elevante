"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Receipt, Send, Trash2 } from "lucide-react";
import { upsertQuotationAction } from "@/actions/admin-ops.actions";
import type { AdminProjectListItem, AdminQuotationItemRecord } from "@/lib/services/admin.service";
import { formatMoneyMinor, formatShortDate } from "@/lib/utils/format";
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

interface DraftItemRow {
  title: string;
  description: string;
  quantity: number;
  unitPriceMajor: string;
}

export function QuotationsManager({
  quotations,
  projects,
  initialProjectId,
}: {
  quotations: AdminQuotationItemRecord[];
  projects: AdminProjectListItem[];
  initialProjectId?: string;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>(
    initialProjectId && projects.some((p) => p.id === initialProjectId)
      ? initialProjectId
      : (projects[0]?.id ?? "")
  );
  const [title, setTitle] = useState("");
  const [scopeSummary, setScopeSummary] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [discountMajor, setDiscountMajor] = useState("0");
  const [taxMajor, setTaxMajor] = useState("0");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [terms, setTerms] = useState(
    "Work begins after quotation acceptance. Milestones and final deliverables are shared in the ELEVANTE Client Portal."
  );
  const [items, setItems] = useState<DraftItemRow[]>([
    { title: "Core Engineering & Delivery", description: "", quantity: 1, unitPriceMajor: "25000" },
  ]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function toMinor(val: string): number {
    const parsed = Number(val);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100);
  }

  const previewSubtotalMinor = items.reduce(
    (sum, item) => sum + Math.max(1, item.quantity) * toMinor(item.unitPriceMajor),
    0
  );
  const previewTotalMinor = Math.max(
    0,
    previewSubtotalMinor - toMinor(discountMajor) + toMinor(taxMajor)
  );

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setScopeSummary("");
    setCurrency("INR");
    setDiscountMajor("0");
    setTaxMajor("0");
    setEstimatedDuration("");
    setValidUntil("");
    setItems([
      {
        title: "Core Engineering & Delivery",
        description: "",
        quantity: 1,
        unitPriceMajor: "25000",
      },
    ]);
  }

  function loadForEdit(q: AdminQuotationItemRecord, asNewVersion = false) {
    setEditingId(asNewVersion ? null : q.id);
    setProjectId(q.project_id);
    setTitle(asNewVersion ? `${q.title} (Revised)` : q.title);
    setScopeSummary(q.scope_summary);
    setCurrency(q.currency);
    setDiscountMajor((q.discount_minor / 100).toFixed(0));
    setTaxMajor((q.tax_minor / 100).toFixed(0));
    setEstimatedDuration(q.estimated_duration ?? "");
    setValidUntil(q.valid_until ?? "");
    setTerms(q.terms ?? "");
    setItems(
      q.items.length > 0
        ? q.items.map((it) => ({
            title: it.title,
            description: it.description ?? "",
            quantity: it.quantity,
            unitPriceMajor: (it.unit_price_minor / 100).toFixed(0),
          }))
        : [{ title: "Core Scope", description: "", quantity: 1, unitPriceMajor: "0" }]
    );
    setFeedback(null);
  }

  async function saveQuote(dispatchNow: boolean) {
    setBusy(true);
    setFeedback(null);

    const res = await upsertQuotationAction({
      ...(editingId ? { id: editingId } : {}),
      projectId,
      title,
      scopeSummary,
      discountMinor: toMinor(discountMajor),
      taxMinor: toMinor(taxMajor),
      currency,
      estimatedDuration,
      validUntil,
      terms,
      dispatchNow,
      items: items.map((item, idx) => ({
        title: item.title,
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPriceMinor: toMinor(item.unitPriceMajor),
        displayOrder: idx,
      })),
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({
      type: "success",
      message: dispatchNow
        ? "Quotation dispatched to client and project status moved to Quoted."
        : "Draft quotation saved cleanly.",
    });
    resetForm();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Proposal & Commercials
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Quotation Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create versioned line-item proposals; line totals and grand totals are recomputed strictly
          on the server.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No customer projects exist yet. Quotations attach to submitted project requests.
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? "Edit Draft Quotation" : "Build New Quotation"}
              </CardTitle>
              <CardDescription>Drafts stay hidden from customers until dispatched.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback ? (
                <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
                  <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="qt-project">Target Project</Label>
                <Select
                  value={projectId}
                  onValueChange={setProjectId}
                  disabled={Boolean(editingId)}
                >
                  <SelectTrigger id="qt-project">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.project_code} — {p.title} ({p.customerName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                <div className="space-y-2">
                  <Label htmlFor="qt-title">Quotation Title</Label>
                  <Input
                    id="qt-title"
                    placeholder="Phase 1 Platform Build Proposal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qt-currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="qt-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qt-scope">Scope Summary</Label>
                <Textarea
                  id="qt-scope"
                  rows={3}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  placeholder="Summarize inclusions, architecture boundaries, and delivery stages..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items ({items.length})</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setItems((prev) => [
                        ...prev,
                        { title: "", description: "", quantity: 1, unitPriceMajor: "0" },
                      ])
                    }
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="bg-background space-y-2 rounded-xl border p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_76px_110px_auto]">
                      <Input
                        placeholder="Deliverable / milestone"
                        value={item.title}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, title: e.target.value } : row
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        min={1}
                        aria-label="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, quantity: Number(e.target.value) || 1 } : row
                            )
                          )
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        aria-label="Unit price"
                        value={item.unitPriceMajor}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, unitPriceMajor: e.target.value } : row
                            )
                          )
                        }
                      />
                      {items.length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove line item"
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      ) : null}
                    </div>
                    <Input
                      placeholder="Optional line notes"
                      value={item.description}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) =>
                            i === idx ? { ...row, description: e.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qt-discount">Discount ({currency})</Label>
                  <Input
                    id="qt-discount"
                    type="number"
                    min={0}
                    value={discountMajor}
                    onChange={(e) => setDiscountMajor(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qt-tax">Tax / GST ({currency})</Label>
                  <Input
                    id="qt-tax"
                    type="number"
                    min={0}
                    value={taxMajor}
                    onChange={(e) => setTaxMajor(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qt-duration">Estimated Duration</Label>
                  <Input
                    id="qt-duration"
                    placeholder="e.g., 4–6 weeks"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qt-valid">Valid Until</Label>
                  <Input
                    id="qt-valid"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qt-terms">Terms & Conditions</Label>
                <Textarea
                  id="qt-terms"
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>

              <div className="bg-background flex items-center justify-between rounded-xl border p-3 text-sm font-semibold">
                <span>Estimated Total</span>
                <span className="text-foreground text-base">
                  {formatMoneyMinor(previewTotalMinor, currency)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => saveQuote(false)}
                >
                  <Receipt className="size-4" aria-hidden="true" />
                  <span>{busy ? "Saving..." : "Save Draft"}</span>
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  className="bg-brand-gradient text-white"
                  onClick={() => saveQuote(true)}
                >
                  <Send className="size-4" aria-hidden="true" />
                  <span>{busy ? "Sending..." : "Save & Dispatch to Client"}</span>
                </Button>
                {editingId ? (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {quotations.length === 0 ? (
              <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
                No quotations created yet.
              </Card>
            ) : (
              quotations.map((q) => (
                <Card key={q.id} className="bg-card">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-secondary font-mono font-semibold">
                          {q.quote_number} · v{q.version}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {q.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-foreground font-bold">
                        {formatMoneyMinor(q.total_minor, q.currency)}
                      </span>
                    </div>

                    <div>
                      <p className="text-foreground font-semibold">{q.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {q.projectCode} · {q.customerName} · Created {formatShortDate(q.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.status === "draft" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => loadForEdit(q, false)}
                        >
                          Edit Draft
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => loadForEdit(q, true)}
                      >
                        Create New Version
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
