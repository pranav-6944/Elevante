"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip } from "lucide-react";
import { buildDynamicFormSchema, type DynamicFieldSpec } from "@/lib/validations/dynamic-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DynamicServiceFormProps {
  fields: DynamicFieldSpec[];
  mode?: "preview" | "submit";
  submitLabel?: string;
  onSubmitValues?: (values: Record<string, unknown>) => Promise<void> | void;
}

export function DynamicServiceForm({
  fields,
  mode = "submit",
  submitLabel = "Submit Requirements",
  onSubmitValues,
}: DynamicServiceFormProps) {
  const activeFields = useMemo(
    () => [...fields].filter((f) => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [fields]
  );

  const schema = useMemo(() => buildDynamicFormSchema(activeFields), [activeFields]);

  const defaultValues = useMemo(() => {
    const defaults: Record<string, unknown> = {};
    for (const field of activeFields) {
      if (field.fieldType === "checkbox") defaults[field.fieldKey] = false;
      else if (field.fieldType === "multiselect" || field.fieldType === "file") {
        defaults[field.fieldKey] = [];
      } else {
        defaults[field.fieldKey] = "";
      }
    }
    return defaults;
  }, [activeFields]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  if (activeFields.length === 0) {
    return (
      <div className="bg-muted/30 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        No custom brief fields configured for this service yet.
      </div>
    );
  }

  async function handleFormSubmit(data: Record<string, unknown>) {
    if (mode === "preview") return;
    if (onSubmitValues) {
      await onSubmitValues(data);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
      {activeFields.map((field) => {
        const fieldError = errors[field.fieldKey]?.message;
        const inputId = `dyn-${field.fieldKey}`;

        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={inputId} className="text-sm font-medium">
                {field.label}
                {field.isRequired ? <span className="text-destructive ml-1">*</span> : null}
              </Label>
              {mode === "preview" ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {field.fieldType}
                </Badge>
              ) : null}
            </div>

            {field.fieldType === "textarea" ? (
              <Textarea
                id={inputId}
                rows={4}
                placeholder={field.placeholder ?? ""}
                disabled={mode === "preview"}
                aria-invalid={Boolean(fieldError)}
                {...register(field.fieldKey)}
              />
            ) : field.fieldType === "select" ? (
              <select
                id={inputId}
                disabled={mode === "preview"}
                aria-invalid={Boolean(fieldError)}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-3 focus-visible:outline-none disabled:opacity-70"
                {...register(field.fieldKey)}
              >
                <option value="">{field.placeholder || "Select an option..."}</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.fieldType === "radio" ? (
              <Controller
                name={field.fieldKey}
                control={control}
                render={({ field: ctrl }) => (
                  <div className="bg-background space-y-2 rounded-lg border p-3">
                    {field.options.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2.5 text-sm">
                        <input
                          type="radio"
                          value={opt.value}
                          checked={ctrl.value === opt.value}
                          disabled={mode === "preview"}
                          onChange={() => ctrl.onChange(opt.value)}
                          className="accent-primary"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            ) : field.fieldType === "multiselect" ? (
              <Controller
                name={field.fieldKey}
                control={control}
                render={({ field: ctrl }) => {
                  const selected = Array.isArray(ctrl.value) ? (ctrl.value as string[]) : [];
                  return (
                    <div className="bg-background grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                      {field.options.map((opt) => {
                        const checked = selected.includes(opt.value);
                        return (
                          <label key={opt.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={mode === "preview"}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  ctrl.onChange([...selected, opt.value]);
                                } else {
                                  ctrl.onChange(selected.filter((v) => v !== opt.value));
                                }
                              }}
                              className="accent-primary"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                }}
              />
            ) : field.fieldType === "checkbox" ? (
              <Controller
                name={field.fieldKey}
                control={control}
                render={({ field: ctrl }) => (
                  <label className="bg-background flex items-center gap-2.5 rounded-lg border p-3 text-sm">
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={Boolean(ctrl.value)}
                      disabled={mode === "preview"}
                      onChange={(e) => ctrl.onChange(e.target.checked)}
                      className="accent-primary"
                    />
                    <span>{field.placeholder || "Yes"}</span>
                  </label>
                )}
              />
            ) : field.fieldType === "file" ? (
              <div className="bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs">
                <Paperclip className="size-4 shrink-0" aria-hidden="true" />
                <span>
                  {mode === "preview"
                    ? "Private reference file upload slot (active inside Client Portal)"
                    : "Use the reference file uploader below to attach files for this requirement."}
                </span>
              </div>
            ) : (
              <Input
                id={inputId}
                type={field.fieldType === "number" ? "number" : field.fieldType}
                placeholder={field.placeholder ?? ""}
                disabled={mode === "preview"}
                aria-invalid={Boolean(fieldError)}
                {...register(field.fieldKey)}
              />
            )}

            {field.helpText ? (
              <p className="text-muted-foreground text-xs">{field.helpText}</p>
            ) : null}
            {typeof fieldError === "string" ? (
              <p className="text-destructive text-xs">{fieldError}</p>
            ) : null}
          </div>
        );
      })}

      {mode === "submit" ? (
        <Button type="submit" disabled={isSubmitting} className="bg-brand-gradient text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Submitting...</span>
            </>
          ) : (
            submitLabel
          )}
        </Button>
      ) : null}
    </form>
  );
}
