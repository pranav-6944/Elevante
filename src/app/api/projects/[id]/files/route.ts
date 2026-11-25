import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { extractClientIp } from "@/lib/security/ip";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  parseAndValidateAttachmentFiles,
  uploadProjectAttachments,
} from "@/lib/services/attachment-upload.service";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import { AppError, normalizeActionError } from "@/lib/utils/errors";
import { canUserAccessProject } from "@/lib/validations/projects";
import type { Json } from "@/types/database";

const projectIdSchema = z.string().uuid("Invalid project ID.");

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAuth();

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Supabase environment is not configured.",
          },
        },
        { status: 503 }
      );
    }
    const { id: rawProjectId } = await context.params;
    const parsedId = projectIdSchema.safeParse(rawProjectId);

    if (!parsedId.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid project ID." } },
        { status: 400 }
      );
    }

    if (isAdminSupabaseConfigured()) {
      await enforceRateLimit({
        key: `project-file-upload:${actor.id}`,
        maxRequests: 30,
        windowSeconds: 900,
      });
    }

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, status, project_code")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Project not found." } },
        { status: 404 }
      );
    }

    if (
      !canUserAccessProject({
        actorId: actor.id,
        actorRole: actor.role,
        customerId: project.customer_id,
        assignedTo: project.assigned_to,
      })
    ) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Access denied for this project." } },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const validatedFiles = parseAndValidateAttachmentFiles(formData, 5);
    if (validatedFiles.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "Please select at least one file." },
        },
        { status: 400 }
      );
    }

    const uploaded = await uploadProjectAttachments({
      supabase,
      projectId: project.id,
      uploaderUid: actor.id,
      files: validatedFiles,
    });

    if (isAdminSupabaseConfigured()) {
      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "project_file.uploaded",
        entityType: "project_request",
        entityId: project.id,
        newValues: {
          project_code: project.project_code,
          uploaded_count: uploaded.length,
          file_names: uploaded.map((u) => u.original_filename),
        } as unknown as Json,
        ipAddress: extractClientIp(request.headers),
        userAgent: request.headers.get("user-agent"),
      });
    }

    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/dashboard/files");

    return NextResponse.json({ ok: true, data: { files: uploaded } }, { status: 201 });
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
