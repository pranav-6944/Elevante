import { z } from "zod";
import type { UserRole } from "@/types";
import type { ProjectPriority, ProjectStatus } from "@/types/database";

export const PROJECT_PRIORITIES: readonly ProjectPriority[] = ["low", "normal", "high", "urgent"];

export const MAX_ATTACHMENT_BYTES = 26_214_400; // 25 MB matching Storage bucket policy
export const MAX_ATTACHMENTS_PER_REQUEST = 10;

export const ALLOWED_ATTACHMENT_MIME_EXTENSIONS: ReadonlyMap<string, readonly string[]> = new Map([
  ["image/png", [".png"]],
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/webp", [".webp"]],
  ["application/pdf", [".pdf"]],
  ["text/plain", [".txt", ".md"]],
  ["text/csv", [".csv"]],
  ["application/zip", [".zip"]],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", [".docx"]],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [".xlsx"]],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", [".pptx"]],
]);

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; toneClass: string }> = {
  submitted: {
    label: "Submitted",
    toneClass: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  },
  under_review: {
    label: "Under Review",
    toneClass: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  },
  clarification_needed: {
    label: "Clarification Needed",
    toneClass: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  },
  quoted: {
    label: "Quoted",
    toneClass: "bg-teal-500/10 text-teal-700 border-teal-500/30",
  },
  quote_accepted: {
    label: "Quote Accepted",
    toneClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  },
  in_progress: {
    label: "In Progress",
    toneClass: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  },
  review_ready: {
    label: "Ready for Review",
    toneClass: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  },
  revision_requested: {
    label: "Revision Requested",
    toneClass: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  },
  completed: {
    label: "Completed",
    toneClass: "bg-emerald-600/15 text-emerald-800 border-emerald-600/30",
  },
  cancelled: {
    label: "Cancelled",
    toneClass: "bg-slate-500/10 text-slate-600 border-slate-400/30",
  },
};

export const createProjectRequestSchema = z.object({
  serviceId: z.string().uuid("Please choose a valid service."),
  title: z
    .string()
    .trim()
    .min(4, "Project title must be at least 4 characters.")
    .max(160, "Project title must be 160 characters or fewer."),
  summary: z
    .string()
    .trim()
    .min(20, "Please describe your project goals in at least 20 characters.")
    .max(3000, "Project summary must be 3,000 characters or fewer."),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  desiredDeadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be a valid YYYY-MM-DD date.")
    .optional()
    .or(z.literal("")),
  budgetRange: z
    .string()
    .trim()
    .max(100, "Budget range must be 100 characters or fewer.")
    .optional()
    .or(z.literal("")),
  dynamicResponses: z.record(z.string(), z.unknown()).default({}),
});

export type CreateProjectRequestInput = z.infer<typeof createProjectRequestSchema>;

export function sanitizeAttachmentFilename(name: string): string {
  const leaf = name.split(/[/\\]/).pop() ?? "";
  const dotIdx = leaf.lastIndexOf(".");
  const rawExt =
    dotIdx > 0
      ? leaf
          .slice(dotIdx)
          .toLowerCase()
          .replace(/[^.a-z0-9]/g, "")
      : "";
  const rawStem = dotIdx > 0 ? leaf.slice(0, dotIdx) : leaf;

  const cleanStem = rawStem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return `${cleanStem || "file"}${rawExt}`;
}

export function validateAttachmentMeta({
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

  const allowedExts = ALLOWED_ATTACHMENT_MIME_EXTENSIONS.get(type);
  if (!allowedExts) {
    return {
      ok: false,
      message: `Unsupported file type "${type || "unknown"}" for ${safeName}. Allowed: PNG, JPG, WebP, PDF, TXT, CSV, ZIP, DOCX, XLSX, PPTX.`,
    };
  }

  if (!ext || !allowedExts.includes(ext)) {
    return {
      ok: false,
      message: `File extension "${ext || "none"}" does not match content type ${type}.`,
    };
  }

  if (size <= 0 || size > MAX_ATTACHMENT_BYTES) {
    return {
      ok: false,
      message: `File ${safeName} must be greater than 0 bytes and at most 25 MB.`,
    };
  }

  return { ok: true, safeName };
}

export function buildProjectAttachmentPath(
  projectId: string,
  uploaderUid: string,
  safeName: string,
  uniqueId: string
): string {
  return `${projectId}/${uploaderUid}/${uniqueId}-${safeName}`;
}

export function isValidStoragePrefixForProject(storagePath: string, projectId: string): boolean {
  if (!storagePath || !projectId || storagePath.includes("..")) return false;
  return storagePath.startsWith(`${projectId}/`);
}

export function canUserAccessProject({
  actorId,
  actorRole,
  customerId,
  assignedTo,
}: {
  actorId: string;
  actorRole: UserRole;
  customerId: string;
  assignedTo?: string | null;
}): boolean {
  if (actorRole === "admin" || actorRole === "super_admin") return true;
  if (actorRole === "staff" && assignedTo === actorId) return true;
  return customerId === actorId;
}

export function canUserDownloadFile({
  actorId,
  actorRole,
  customerId,
  assignedTo,
  kind,
  isCustomerAccessible = true,
}: {
  actorId: string;
  actorRole: UserRole;
  customerId: string;
  assignedTo?: string | null;
  kind: "reference" | "deliverable";
  isCustomerAccessible?: boolean;
}): boolean {
  if (!canUserAccessProject({ actorId, actorRole, customerId, assignedTo })) {
    return false;
  }

  if (kind === "deliverable" && actorRole === "customer" && !isCustomerAccessible) {
    return false;
  }

  return true;
}
