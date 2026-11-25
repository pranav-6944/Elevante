"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteServiceFormFieldAction,
  reorderServiceFormFieldsAction,
  upsertServiceFormFieldAction,
} from "@/actions/catalog.actions";
import type { DynamicFieldSpec } from "@/lib/validations/dynamic-form";
import { FORM_FIELD_TYPES } from "@/lib/validations/services";
import type { FormFieldType } from "@/types/database";
import { DynamicServiceForm } from "@/components/services/DynamicServiceForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

function toSnakeKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+/, "")
    .replace(/_+$/, "")
    .slice(0, 60);
}

function optionsToText(options: DynamicFieldSpec["options"]): string {
  return options.map((opt) => `${opt.label}|${opt.value}`).join("\n");
}

function parseOptionsLines(text: string): DynamicFieldSpec["options"] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, valuePart] = line.split("|").map((p) => p.trim());
      const label = labelPart || valuePart || "Option";
      const value =
        valuePart ||
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
      return { label, value };
    });
}

export function FormBuilderClient({
  serviceId,
  serviceTitle,
  fields,
}: {
  serviceId: string;
  serviceTitle: string;
  fields: DynamicFieldSpec[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [fieldType, setFieldType] = useState<FormFieldType>("text");
  const [placeholder, setPlaceholder] = useState("");
  const [helpText, setHelpText] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  function resetForm() {
    setEditingId(null);
    setLabel("");
    setFieldKey("");
    setFieldType("text");
    setPlaceholder("");
    setHelpText("");
    setOptionsText("");
    setIsRequired(false);
    setIsActive(true);
    setMinVal("");
    setMaxVal("");
  }

  function startEdit(field: DynamicFieldSpec) {
    setEditingId(field.id);
    setLabel(field.label);
    setFieldKey(field.fieldKey);
    setFieldType(field.fieldType);
    setPlaceholder(field.placeholder ?? "");
    setHelpText(field.helpText ?? "");
    setOptionsText(optionsToText(field.options));
    setIsRequired(field.isRequired);
    setIsActive(field.isActive);
    setMinVal(field.validationRules.min !== undefined ? String(field.validationRules.min) : "");
    setMaxVal(field.validationRules.max !== undefined ? String(field.validationRules.max) : "");
    setFeedback(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);

    const existingOrder = editingId
      ? (fields.find((f) => f.id === editingId)?.displayOrder ?? fields.length)
      : fields.length;

    const rules: { min?: number; max?: number } = {};
    if (fieldType === "number") {
      if (minVal.trim() !== "") rules.min = Number(minVal);
      if (maxVal.trim() !== "") rules.max = Number(maxVal);
    }

    const res = await upsertServiceFormFieldAction({
      ...(editingId ? { id: editingId } : {}),
      serviceId,
      fieldKey,
      label,
      fieldType,
      placeholder,
      helpText,
      options: ["select", "multiselect", "radio"].includes(fieldType)
        ? parseOptionsLines(optionsText)
        : [],
      validationRules: rules,
      isRequired,
      displayOrder: existingOrder,
      isActive,
    });

    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }

    setFeedback({ type: "success", message: editingId ? "Field updated." : "Field added." });
    resetForm();
    router.refresh();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const ids = fields.map((f) => f.id);
    const [item] = ids.splice(index, 1);
    if (!item) return;
    ids.splice(target, 0, item);

    setBusy(true);
    const res = await reorderServiceFormFieldsAction(serviceId, ids);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    router.refresh();
  }

  async function handleDelete(fieldId: string) {
    setBusy(true);
    const res = await deleteServiceFormFieldAction(fieldId, serviceId);
    setBusy(false);
    if (!res.ok) {
      setFeedback({ type: "error", message: res.error.message });
      return;
    }
    if (editingId === fieldId) resetForm();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Dynamic Form Builder
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">{serviceTitle}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-card h-fit">
          <CardHeader>
            <CardTitle className="text-xl">
              {editingId ? "Edit Field" : "Add Brief Field"}
            </CardTitle>
            <CardDescription>
              Fields defined here generate both client inputs and strict server-side Zod rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {feedback ? (
                <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="text-brand-green size-4" />
                  ) : (
                    <AlertCircle className="size-4" />
                  )}
                  <AlertTitle>{feedback.type === "success" ? "Saved" : "Error"}</AlertTitle>
                  <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fld-label">Field Label</Label>
                  <Input
                    id="fld-label"
                    value={label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLabel(val);
                      if (!editingId) setFieldKey(toSnakeKey(val));
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fld-key">Field Key (snake_case)</Label>
                  <Input
                    id="fld-key"
                    value={fieldKey}
                    onChange={(e) => setFieldKey(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fld-type">Field Type</Label>
                <select
                  id="fld-type"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                  className="border-input flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm"
                >
                  {FORM_FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {["select", "multiselect", "radio"].includes(fieldType) ? (
                <div className="space-y-2">
                  <Label htmlFor="fld-opts">Options (one per line: Label|value)</Label>
                  <Textarea
                    id="fld-opts"
                    rows={4}
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder={"Minimalist|minimal\nInteractive 3D|interactive_3d"}
                  />
                </div>
              ) : null}

              {fieldType === "number" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fld-min">Min Value</Label>
                    <Input
                      id="fld-min"
                      type="number"
                      value={minVal}
                      onChange={(e) => setMinVal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fld-max">Max Value</Label>
                    <Input
                      id="fld-max"
                      type="number"
                      value={maxVal}
                      onChange={(e) => setMaxVal(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="fld-ph">Placeholder (Optional)</Label>
                <Input
                  id="fld-ph"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fld-help">Help Text (Optional)</Label>
                <Input
                  id="fld-help"
                  value={helpText}
                  onChange={(e) => setHelpText(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <Label htmlFor="fld-req">Required</Label>
                  <Switch id="fld-req" checked={isRequired} onCheckedChange={setIsRequired} />
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <Label htmlFor="fld-act">Active</Label>
                  <Switch id="fld-act" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy} className="bg-brand-gradient text-white">
                  <Plus className="size-4" aria-hidden="true" />
                  <span>{editingId ? "Update Field" : "Add Field"}</span>
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Configured Fields ({fields.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm">No fields defined yet.</p>
              ) : (
                fields.map((f, index) => (
                  <div
                    key={f.id}
                    className="bg-background flex items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{f.label}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {f.fieldType}
                        </Badge>
                        {f.isRequired ? <Badge variant="secondary">Required</Badge> : null}
                        {!f.isActive ? <Badge variant="outline">Hidden</Badge> : null}
                      </div>
                      <p className="text-muted-foreground font-mono text-xs">{f.fieldKey}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={busy || index === 0}
                        aria-label="Move up"
                        onClick={() => handleMove(index, -1)}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={busy || index === fields.length - 1}
                        aria-label="Move down"
                        onClick={() => handleMove(index, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Edit ${f.label}`}
                        onClick={() => startEdit(f)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={busy}
                        aria-label={`Delete ${f.label}`}
                        onClick={() => handleDelete(f.id)}
                      >
                        <Trash2 className="text-destructive size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Live Brief Preview</CardTitle>
              <CardDescription>Exactly how customers see this service intake form.</CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicServiceForm fields={fields} mode="preview" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
