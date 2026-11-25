import { z } from "zod";
import type { UserRole } from "@/types";
import type { ProjectStatus, QuotationStatus } from "@/types/database";
import { canUserAccessProject, sanitizeAttachmentFilename } from "./projects.ts";

export const MAX_DELIVERABLE_BYTES = 104_857_600; // 100 MB matching project-deliverables bucket

export const ALLOWED_DELIVERABLE_MIME_EXTENSIONS: ReadonlyMap<string, readonly string[]> = new Map([
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/webp", [".webp"]],
  ["video/mp4", [".mp4"]],
  ["application/pdf", [".pdf"]],
  ["text/csv", [".csv"]],
  ["application/zip", [".zip"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [".xlsx"]],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", [".pptx"]],
]);

export const customerQuotationResponseSchema = z
  .object({
    quotationId: z.string().uuid("Invalid quotation identifier."),
    decision: z.enum(["accepted", "revision_requested", "declined"]),
    note: z
      .string()
      .trim()
      .max(1500, "Response note must be 1,500 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.decision === "revision_requested" && (!val.note || val.note.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["note"],
        message: "Please explain what should be adjusted in at least 5 characters.",
      });
    }
  });

export type CustomerQuotationResponseInput = z.infer<typeof customerQuotationResponseSchema>;

export const projectMessageSchema = z.object({
  projectId: z.string().uuid("Invalid project identifier."),
  messageType: z
    .enum(["message", "clarification_request", "clarification_response"])
    .default("message"),
  body: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters.")
    .max(4000, "Message must be 4,000 characters or fewer."),
  isInternalNote: z.boolean().default(false),
});

export type ProjectMessageInput = z.infer<typeof projectMessageSchema>;

export const deliverableMetaSchema = z.object({
  projectId: z.string().uuid("Invalid project identifier."),
  title: z
    .string()
    .trim()
    .min(3, "Deliverable title must be at least 3 characters.")
    .max(160, "Deliverable title must be 160 characters or fewer."),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  versionLabel: z.string().trim().min(1).max(40).default("v1.0"),
  isCustomerAccessible: z.boolean().default(true),
});

export type DeliverableMetaInput = z.infer<typeof deliverableMetaSchema>;

export const deliverableVisibilitySchema = z.object({
  deliverableId: z.string().uuid("Invalid deliverable identifier."),
  isCustomerAccessible: z.boolean(),
});

export function validateDeliverableFileMeta({
  name,
  type,
  size,
}: {
  name: string;
  type: string;
  size: number;
}): { ok: true; safeName: string } | { ok: false; message: string } {
  const safeName = sanitizeAttachmentFilename(name);
  const dotIdx = safeName.lastIndexOf(".");
  const ext = dotIdx > 0 ? safeName.slice(dotIdx).toLowerCase() : "";

  const allowedExts = ALLOWED_DELIVERABLE_MIME_EXTENSIONS.get(type);
  if (!allowedExts) {
    return {
      ok: false,
      message: `Unsupported deliverable type "${type || "unknown"}". Allowed: PNG, JPG, WebP, MP4, PDF, CSV, ZIP, DOCX, XLSX, PPTX.`,
    };
  }

  if (!ext || !allowedExts.includes(ext)) {
    return {
      ok: false,
      message: `File extension "${ext || "none"}" does not match content type ${type}.`,
    };
  }

  if (size <= 0 || size > MAX_DELIVERABLE_BYTES) {
    return {
      ok: false,
      message: `Deliverable ${safeName} must be greater than 0 bytes and at most 100 MB.`,
    };
  }

  return { ok: true, safeName };
}

export function buildDeliverableStoragePath(
  projectId: string,
  safeName: string,
  uniqueId: string
): string {
  return `${projectId}/${uniqueId}-${safeName}`;
}

export function canCustomerRespondToQuotation(
  status: QuotationStatus
): { ok: true } | { ok: false; message: string } {
  if (status === "sent" || status === "viewed") {
    return { ok: true };
  }
  if (status === "draft") {
    return { ok: false, message: "Draft quotations cannot be responded to." };
  }
  return {
    ok: false,
    message: `Quotation in status "${status}" can no longer be changed.`,
  };
}

export function validateMessageAuthorization({
  actorId,
  actorRole,
  customerId,
  assignedTo,
  projectStatus,
  messageType,
  isInternalNote,
}: {
  actorId: string;
  actorRole: UserRole;
  customerId: string;
  assignedTo?: string | null;
  projectStatus: ProjectStatus;
  messageType: "message" | "clarification_request" | "clarification_response";
  isInternalNote: boolean;
}): { ok: true } | { ok: false; message: string } {
  if (!canUserAccessProject({ actorId, actorRole, customerId, assignedTo })) {
    return { ok: false, message: "You do not have access to this project." };
  }

  if (projectStatus === "cancelled") {
    return { ok: false, message: "Cancelled projects cannot receive new messages." };
  }

  if (actorRole === "customer") {
    if (isInternalNote) {
      return { ok: false, message: "Customers cannot post internal notes." };
    }
    if (messageType === "clarification_request") {
      return {
        ok: false,
        message: "Only agency team members can submit clarification requests.",
      };
    }
  } else if (messageType === "clarification_response") {
    return {
      ok: false,
      message: "Clarification responses are reserved for the project owner.",
    };
  }

  return { ok: true };
}

export function getNextProjectStatusAfterMessage({
  currentStatus,
  messageType,
  isInternalNote,
  actorRole,
}: {
  currentStatus: ProjectStatus;
  messageType: "message" | "clarification_request" | "clarification_response";
  isInternalNote: boolean;
  actorRole: UserRole;
}): ProjectStatus | null {
  if (isInternalNote || currentStatus === "completed" || currentStatus === "cancelled") {
    return null;
  }

  if (actorRole !== "customer" && messageType === "clarification_request") {
    return "clarification_needed";
  }

  if (
    actorRole === "customer" &&
    messageType === "clarification_response" &&
    currentStatus === "clarification_needed"
  ) {
    return "under_review";
  }

  return null;
}
