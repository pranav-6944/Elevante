import { z } from "zod";
import type { FormFieldType, Json } from "@/types/database";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface DynamicFieldSpec {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  options: FieldOption[];
  validationRules: FieldValidationRules;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

export function parseFieldOptions(raw: Json): FieldOption[] {
  if (!Array.isArray(raw)) return [];
  const options: FieldOption[] = [];
  for (const item of raw) {
    if (
      typeof item === "object" &&
      item !== null &&
      "label" in item &&
      "value" in item &&
      typeof item.label === "string" &&
      typeof item.value === "string"
    ) {
      options.push({ label: item.label, value: item.value });
    }
  }
  return options;
}

export function parseValidationRules(raw: Json): FieldValidationRules {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const rules: FieldValidationRules = {};
  if (typeof raw.min === "number") rules.min = raw.min;
  if (typeof raw.max === "number") rules.max = raw.max;
  if (typeof raw.minLength === "number") rules.minLength = raw.minLength;
  if (typeof raw.maxLength === "number") rules.maxLength = raw.maxLength;
  if (typeof raw.pattern === "string") rules.pattern = raw.pattern;
  return rules;
}

function buildFieldSchema(field: DynamicFieldSpec): z.ZodTypeAny {
  const rules = field.validationRules;

  switch (field.fieldType) {
    case "number": {
      const numBase = z.number({ message: `${field.label} must be a valid number.` }).finite();
      let constrained = numBase;
      if (typeof rules.min === "number") {
        constrained = constrained.min(rules.min, `${field.label} must be at least ${rules.min}.`);
      }
      if (typeof rules.max === "number") {
        constrained = constrained.max(rules.max, `${field.label} must be at most ${rules.max}.`);
      }
      if (field.isRequired) {
        return z.preprocess(
          (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
          constrained
        );
      }
      return z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        constrained.optional()
      );
    }

    case "email": {
      const base = z
        .string()
        .trim()
        .email(`${field.label} must be a valid email address.`)
        .max(160);
      return field.isRequired ? base : z.union([base, z.literal("")]).optional();
    }

    case "url": {
      const urlValidator = z
        .string()
        .trim()
        .max(500)
        .refine((val) => {
          try {
            const parsed = new URL(val);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
          } catch {
            return false;
          }
        }, `${field.label} must be a valid http(s) URL.`);
      return field.isRequired ? urlValidator : z.union([urlValidator, z.literal("")]).optional();
    }

    case "date": {
      const dateSchema = z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, `${field.label} must be a valid date.`);
      return field.isRequired ? dateSchema : z.union([dateSchema, z.literal("")]).optional();
    }

    case "select":
    case "radio": {
      const allowed = new Set(field.options.map((opt) => opt.value));
      const choiceSchema = z
        .string()
        .trim()
        .refine(
          (val) => allowed.size === 0 || allowed.has(val),
          `Invalid selection for ${field.label}.`
        );
      if (field.isRequired) {
        return choiceSchema.refine((val) => val.length > 0, `${field.label} is required.`);
      }
      return z.union([choiceSchema, z.literal("")]).optional();
    }

    case "multiselect": {
      const allowed = new Set(field.options.map((opt) => opt.value));
      const arrSchema = z
        .array(z.string().trim())
        .refine(
          (vals) => allowed.size === 0 || vals.every((v) => allowed.has(v)),
          `Invalid choice selected for ${field.label}.`
        );
      return field.isRequired
        ? arrSchema.min(1, `Please select at least one option for ${field.label}.`)
        : arrSchema.default([]);
    }

    case "checkbox": {
      const boolSchema = z.boolean();
      return field.isRequired
        ? boolSchema.refine((val) => val === true, `${field.label} must be checked.`)
        : boolSchema.default(false);
    }

    case "file": {
      const filesSchema = z.array(z.string().trim().min(1)).max(10);
      return field.isRequired
        ? filesSchema.min(1, `Please attach at least one file for ${field.label}.`)
        : filesSchema.default([]);
    }

    case "textarea":
    case "text":
    default: {
      const maxLen = rules.maxLength ?? (field.fieldType === "textarea" ? 5000 : 500);
      let finalStr: z.ZodTypeAny = z
        .string()
        .trim()
        .max(maxLen, `${field.label} must be ${maxLen} characters or fewer.`);
      if (field.isRequired) {
        finalStr = (finalStr as z.ZodString).min(
          rules.minLength ?? 1,
          `${field.label} is required.`
        );
      } else if (typeof rules.minLength === "number" && rules.minLength > 0) {
        const minL = rules.minLength;
        finalStr = finalStr.refine(
          (v) => typeof v === "string" && (v.length === 0 || v.length >= minL),
          `${field.label} must be at least ${minL} characters.`
        );
      }
      if (rules.pattern) {
        try {
          const regex = new RegExp(rules.pattern);
          finalStr = finalStr.refine(
            (v) => typeof v === "string" && (v.length === 0 || regex.test(v)),
            `${field.label} format is invalid.`
          );
        } catch {
          // Ignore malformed regex from admin config rather than crashing validation
        }
      }
      return field.isRequired ? finalStr : finalStr.optional().or(z.literal(""));
    }
  }
}

export function buildDynamicFormSchema(fields: DynamicFieldSpec[]) {
  const activeFields = [...fields]
    .filter((f) => f.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of activeFields) {
    shape[field.fieldKey] = buildFieldSchema(field);
  }

  return z.object(shape).strict();
}

export interface SnapshotResponseRow {
  fieldId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: FormFieldType;
  displayOrder: number;
  responseValue: Json;
}

export function validateDynamicBriefSubmission(
  fields: DynamicFieldSpec[],
  rawPayload: unknown
):
  | { ok: true; responses: SnapshotResponseRow[]; schemaSnapshot: DynamicFieldSpec[] }
  | { ok: false; fieldErrors: Record<string, string[]> } {
  const activeFields = [...fields]
    .filter((f) => f.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const schema = buildDynamicFormSchema(activeFields);
  const parsed = schema.safeParse(rawPayload ?? {});

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_root";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return { ok: false, fieldErrors };
  }

  const data = parsed.data as Record<string, unknown>;
  const responses: SnapshotResponseRow[] = activeFields.map((field) => ({
    fieldId: field.id,
    fieldKey: field.fieldKey,
    fieldLabel: field.label,
    fieldType: field.fieldType,
    displayOrder: field.displayOrder,
    responseValue: (data[field.fieldKey] ?? null) as Json,
  }));

  return {
    ok: true,
    responses,
    schemaSnapshot: activeFields.map((field) => ({
      ...field,
      options: field.options.map((opt) => ({ ...opt })),
      validationRules: { ...field.validationRules },
    })),
  };
}
