import { z } from "zod";
import type { UserRole } from "@/types";
import type { EnquiryStatus, QuotationStatus } from "@/types/database";

export const ENQUIRY_STATUSES: readonly EnquiryStatus[] = [
  "new",
  "contacted",
  "converted",
  "archived",
];

export const QUOTATION_STATUSES: readonly QuotationStatus[] = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "revision_requested",
  "declined",
  "expired",
];

const optionalUuidSchema = z.string().uuid("Invalid identifier.").optional().or(z.literal(""));

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((val) => {
    if (!val) return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL must use http:// or https://.")
  .optional()
  .or(z.literal(""));

export const enquiryUpdateSchema = z.object({
  id: z.string().uuid("Invalid enquiry ID."),
  status: z.enum(["new", "contacted", "converted", "archived"]),
  assignedTo: optionalUuidSchema,
  internalNotes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type EnquiryUpdateInput = z.infer<typeof enquiryUpdateSchema>;

export const toggleCustomerActiveSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  isActive: z.boolean(),
});

export const adminProjectUpdateSchema = z.object({
  projectId: z.string().uuid("Invalid project ID."),
  status: z.enum([
    "submitted",
    "under_review",
    "clarification_needed",
    "quoted",
    "quote_accepted",
    "in_progress",
    "review_ready",
    "revision_requested",
    "completed",
    "cancelled",
  ]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  assignedTo: optionalUuidSchema,
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type AdminProjectUpdateInput = z.infer<typeof adminProjectUpdateSchema>;

export const quotationLineItemSchema = z.object({
  title: z.string().trim().min(2, "Line item title is required.").max(160),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(10000),
  unitPriceMinor: z.coerce
    .number()
    .int()
    .min(0, "Unit price cannot be negative.")
    .max(1_000_000_000),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type QuotationLineItemInput = z.infer<typeof quotationLineItemSchema>;

export const quotationUpsertSchema = z.object({
  id: optionalUuidSchema,
  projectId: z.string().uuid("Select a target project."),
  title: z.string().trim().min(3, "Quotation title must be at least 3 characters.").max(160),
  scopeSummary: z
    .string()
    .trim()
    .min(10, "Scope summary must be at least 10 characters.")
    .max(4000),
  discountMinor: z.coerce.number().int().min(0).max(1_000_000_000).default(0),
  taxMinor: z.coerce.number().int().min(0).max(1_000_000_000).default(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter ISO code.")
    .default("INR"),
  estimatedDuration: z.string().trim().max(100).optional().or(z.literal("")),
  validUntil: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Valid-until date must be YYYY-MM-DD.")
    .optional()
    .or(z.literal("")),
  terms: z.string().trim().max(5000).optional().or(z.literal("")),
  dispatchNow: z.boolean().default(false),
  items: z.array(quotationLineItemSchema).min(1, "Add at least one quotation line item.").max(50),
});

export type QuotationUpsertInput = z.infer<typeof quotationUpsertSchema>;

export function calculateQuotationTotals(
  items: readonly QuotationLineItemInput[],
  discountMinor: number,
  taxMinor: number
):
  | {
      ok: true;
      computedItems: Array<QuotationLineItemInput & { lineTotalMinor: number }>;
      subtotalMinor: number;
      discountMinor: number;
      taxMinor: number;
      totalMinor: number;
    }
  | { ok: false; message: string } {
  if (items.length === 0) {
    return { ok: false, message: "Quotation requires at least one line item." };
  }

  let subtotalMinor = 0;
  const computedItems = items.map((item, idx) => {
    const lineTotalMinor = item.quantity * item.unitPriceMinor;
    subtotalMinor += lineTotalMinor;
    return {
      ...item,
      displayOrder: item.displayOrder ?? idx,
      lineTotalMinor,
    };
  });

  if (discountMinor < 0 || taxMinor < 0) {
    return { ok: false, message: "Discount and tax cannot be negative." };
  }

  if (discountMinor > subtotalMinor) {
    return { ok: false, message: "Discount cannot exceed the quotation subtotal." };
  }

  const totalMinor = subtotalMinor - discountMinor + taxMinor;
  return {
    ok: true,
    computedItems,
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor,
  };
}

export const portfolioUpsertSchema = z.object({
  id: optionalUuidSchema,
  serviceId: optionalUuidSchema,
  title: z.string().trim().min(3, "Project title is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  clientName: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(100).optional().or(z.literal("")),
  summary: z.string().trim().min(15, "Summary must be at least 15 characters.").max(500),
  challenge: z.string().trim().max(5000).optional().or(z.literal("")),
  solution: z.string().trim().max(5000).optional().or(z.literal("")),
  outcomes: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  techStack: z.array(z.string().trim().min(1).max(60)).max(25).default([]),
  liveUrl: optionalHttpUrlSchema,
  coverMediaId: optionalUuidSchema,
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
});

export type PortfolioUpsertInput = z.infer<typeof portfolioUpsertSchema>;

export const testimonialUpsertSchema = z.object({
  id: optionalUuidSchema,
  portfolioProjectId: optionalUuidSchema,
  authorName: z.string().trim().min(2, "Author name is required.").max(120),
  authorRole: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  quote: z.string().trim().min(15, "Testimonial quote must be at least 15 characters.").max(1200),
  rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type TestimonialUpsertInput = z.infer<typeof testimonialUpsertSchema>;

export const teamMemberUpsertSchema = z.object({
  id: optionalUuidSchema,
  profileId: optionalUuidSchema,
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  roleTitle: z.string().trim().min(2, "Role title is required.").max(120),
  isFounder: z.boolean().default(false),
  bio: z.string().trim().max(1500).optional().or(z.literal("")),
  avatarMediaId: optionalUuidSchema,
  linkedinUrl: optionalHttpUrlSchema,
  githubUrl: optionalHttpUrlSchema,
  websiteUrl: optionalHttpUrlSchema,
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type TeamMemberUpsertInput = z.infer<typeof teamMemberUpsertSchema>;

export const userRoleChangeSchema = z.object({
  targetUserId: z.string().uuid("Invalid target user ID."),
  roleSlug: z.enum(["customer", "staff", "admin", "super_admin"]),
  isActive: z.boolean(),
});

export type UserRoleChangeInput = z.infer<typeof userRoleChangeSchema>;

export const platformSettingUpsertSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/, "Setting key must contain lowercase letters, numbers, or underscores."),
  valueJson: z.string().trim().min(2, "Setting JSON value is required."),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  isPublic: z.boolean().default(false),
});

export type PlatformSettingUpsertInput = z.infer<typeof platformSettingUpsertSchema>;

export function canActorManageRoleChange({
  actorId,
  actorRole,
  targetUserId,
}: {
  actorId: string;
  actorRole: UserRole;
  targetUserId: string;
}): { ok: true } | { ok: false; message: string } {
  if (actorRole !== "super_admin") {
    return { ok: false, message: "Only Super Administrators can alter user roles." };
  }
  if (actorId === targetUserId) {
    return {
      ok: false,
      message: "You cannot modify your own role or deactivate your own Super Admin account.",
    };
  }
  return { ok: true };
}

export function canActorToggleProfileStatus({
  actorId,
  actorRole,
  targetUserId,
  targetCurrentRole,
}: {
  actorId: string;
  actorRole: UserRole;
  targetUserId: string;
  targetCurrentRole: UserRole;
}): { ok: true } | { ok: false; message: string } {
  if (actorRole !== "admin" && actorRole !== "super_admin") {
    return { ok: false, message: "Only Administrators can update user activation status." };
  }
  if (actorId === targetUserId) {
    return { ok: false, message: "You cannot deactivate your own active session account." };
  }
  if (targetCurrentRole === "super_admin" && actorRole !== "super_admin") {
    return { ok: false, message: "Only Super Administrators can alter a Super Admin account." };
  }
  return { ok: true };
}
