import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { isAdminRole } from "@/lib/auth/rbac";
import { sendDeliverableReleasedEmail } from "@/lib/email/resend";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AppError, normalizeActionError, normalizeDatabaseError } from "@/lib/utils/errors";
import {
  buildDeliverableStoragePath,
  deliverableMetaSchema,
  validateDeliverableFileMeta,
} from "@/lib/validations/workflow";
import type { Json } from "@/types/database";

const projectIdSchema = z.string().uuid("Invalid project ID.");

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAuth();

    if (!isAdminRole(actor.role) && actor.role !== "staff") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Only agency team members can upload deliverables.",
          },
        },
        { status: 403 }
      );
    }

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

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, project_code, title")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Project not found." } },
        { status: 404 }
      );
    }

    if (!isAdminRole(actor.role) && project.assigned_to !== actor.id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Staff can only upload deliverables on assigned projects.",
          },
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "No deliverable file uploaded." },
        },
        { status: 400 }
      );
    }

    const metaCheck = deliverableMetaSchema.safeParse({
      projectId: project.id,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      versionLabel: String(formData.get("versionLabel") ?? "v1.0") || "v1.0",
      isCustomerAccessible: String(formData.get("isCustomerAccessible") ?? "true") !== "false",
    });

    if (!metaCheck.success) {
      return NextResponse.json(
        { ok: false, error: normalizeActionError(metaCheck.error) },
        { status: 400 }
      );
    }

    const fileCheck = validateDeliverableFileMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!fileCheck.ok) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: fileCheck.message } },
        { status: 400 }
      );
    }

    const storagePath = buildDeliverableStoragePath(
      project.id,
      fileCheck.safeName,
      crypto.randomUUID()
    );
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("project-deliverables")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "DATABASE_ERROR", message: "Deliverable storage upload failed." },
        },
        { status: 500 }
      );
    }

    const { data: deliverable, error: dbErr } = await supabase
      .from("deliverables")
      .insert({
        project_id: project.id,
        uploaded_by: actor.id,
        title: metaCheck.data.title,
        description: metaCheck.data.description || null,
        version_label: metaCheck.data.versionLabel,
        bucket: "project-deliverables",
        storage_path: storagePath,
        original_filename: file.name.slice(0, 200),
        mime_type: file.type,
        file_size: file.size,
        is_customer_accessible: metaCheck.data.isCustomerAccessible,
      })
      .select("*")
      .single();

    if (dbErr || !deliverable) {
      await supabase.storage.from("project-deliverables").remove([storagePath]);
      throw normalizeDatabaseError(dbErr, "Could not save deliverable record.");
    }

    if (isAdminSupabaseConfigured()) {
      const admin = createAdminClient();
      const tasks: Array<PromiseLike<unknown>> = [
        recordAuditLog({
          actorId: actor.id,
          actorEmail: actor.email,
          action: "deliverable.uploaded",
          entityType: "deliverable",
          entityId: deliverable.id,
          newValues: {
            project_id: project.id,
            title: metaCheck.data.title,
            version_label: metaCheck.data.versionLabel,
            is_customer_accessible: metaCheck.data.isCustomerAccessible,
          } as unknown as Json,
        }),
      ];

      if (metaCheck.data.isCustomerAccessible) {
        tasks.push(
          admin.from("notifications").insert({
            user_id: project.customer_id,
            type: "deliverable_released",
            title: `Deliverable Ready (${project.project_code})`,
            body: `"${metaCheck.data.title}" (${metaCheck.data.versionLabel}) is ready for download.`,
            link_url: `/dashboard/projects/${project.id}`,
            metadata: { project_id: project.id, deliverable_id: deliverable.id },
          })
        );

        const { data: custProfile } = await admin
          .from("profiles")
          .select("email")
          .eq("id", project.customer_id)
          .maybeSingle();

        if (custProfile?.email) {
          tasks.push(
            sendDeliverableReleasedEmail({
              recipientEmail: custProfile.email,
              projectCode: project.project_code,
              projectTitle: project.title,
              deliverableTitle: metaCheck.data.title,
              versionLabel: metaCheck.data.versionLabel,
            })
          );
        }
      }

      await Promise.allSettled(tasks);
    }

    revalidatePath(`/admin/projects/${project.id}`);
    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/dashboard/files");
    revalidatePath("/dashboard/notifications");

    return NextResponse.json({ ok: true, data: deliverable }, { status: 201 });
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
