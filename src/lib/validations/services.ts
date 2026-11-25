import { z } from "zod";
import type { FormFieldType, PricingMode } from "@/types/database";

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const FIELD_KEY_REGEX = /^[a-z][a-z0-9_]*$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const PRICING_MODES: readonly PricingMode[] = [
  "quote_only",
  "starting_from",
  "fixed_estimate",
];

export const FORM_FIELD_TYPES: readonly FormFieldType[] = [
  "text",
  "textarea",
  "number",
  "email",
  "url",
  "date",
  "select",
  "multiselect",
  "radio",
  "checkbox",
  "file",
];

export const categoryUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens."),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  iconName: z.string().trim().max(50).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
});

export const serviceUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid("Please select a valid service category."),
  title: z.string().trim().min(2, "Service title must be at least 2 characters.").max(140),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens."),
  shortDescription: z.string().trim().min(10, "Short description is too brief.").max(300),
  fullDescription: z.string().trim().min(20, "Full description is too brief.").max(8000),
  deliverables: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  features: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  techStack: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  estimatedTimeline: z.string().trim().max(100).optional().or(z.literal("")),
  pricingMode: z.enum(["quote_only", "starting_from", "fixed_estimate"]).default("quote_only"),
  startingPriceMinor: z.coerce.number().int().min(0).max(1000000000).nullable().optional(),
  currency: z.enum(["INR", "USD"]).default("INR"),
  thumbnailMediaId: z.string().uuid().nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
});

export const fieldOptionSchema = z.object({
  label: z.string().trim().min(1, "Option label is required.").max(120),
  value: z.string().trim().min(1, "Option value is required.").max(120),
});

export const fieldValidationRulesSchema = z
  .object({
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    minLength: z.number().int().min(0).max(10000).optional(),
    maxLength: z.number().int().min(1).max(20000).optional(),
    pattern: z.string().max(250).optional(),
  })
  .default({});

export const serviceFormFieldUpsertSchema = z
  .object({
    id: z.string().uuid().optional(),
    serviceId: z.string().uuid(),
    fieldKey: z
      .string()
      .trim()
      .min(2)
      .max(64)
      .regex(
        FIELD_KEY_REGEX,
        "Field key must start with a letter and use lowercase letters, numbers, or underscores."
      ),
    label: z.string().trim().min(1, "Field label is required.").max(140),
    fieldType: z.enum([
      "text",
      "textarea",
      "number",
      "email",
      "url",
      "date",
      "select",
      "multiselect",
      "radio",
      "checkbox",
      "file",
    ]),
    placeholder: z.string().trim().max(200).optional().or(z.literal("")),
    helpText: z.string().trim().max(300).optional().or(z.literal("")),
    options: z.array(fieldOptionSchema).max(50).default([]),
    validationRules: fieldValidationRulesSchema,
    isRequired: z.boolean().default(false),
    displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) =>
      !["select", "multiselect", "radio"].includes(data.fieldType) || data.options.length > 0,
    {
      message: "Choice fields (select, multiselect, radio) require at least one option.",
      path: ["options"],
    }
  );

export const faqUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(80).default("general"),
  serviceId: z.string().uuid().nullable().optional(),
  question: z.string().trim().min(5, "Question is too short.").max(300),
  answer: z.string().trim().min(10, "Answer is too short.").max(4000),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(false),
});

export const siteSectionUpsertSchema = z.object({
  pageKey: z.string().trim().min(2).max(60),
  sectionKey: z.string().trim().min(2).max(60),
  title: z.string().trim().max(300).optional().or(z.literal("")),
  subtitle: z.string().trim().max(1000).optional().or(z.literal("")),
  contentJson: z.string().default("{}"),
  seoMetadataJson: z.string().default("{}"),
  isPublished: z.boolean().default(true),
});

export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;
export type ServiceUpsertInput = z.infer<typeof serviceUpsertSchema>;
export type ServiceFormFieldUpsertInput = z.infer<typeof serviceFormFieldUpsertSchema>;
export type FaqUpsertInput = z.infer<typeof faqUpsertSchema>;
export type SiteSectionUpsertInput = z.infer<typeof siteSectionUpsertSchema>;
