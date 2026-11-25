import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AppError, normalizeActionError } from "@/lib/utils/errors";
import { canUserDownloadFile, isValidStoragePrefixForProject } from "@/lib/validations/projects";

const fileIdSchema = z.string().uuid("Invalid file ID.");
const kindSchema = z.enum(["reference", "deliverable"]).default("reference");

export async function GET(request: Request, context: { params: Promise<{ fileId: string }> }) {
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
    const { fileId: rawFileId } = await context.params;
    const parsedId = fileIdSchema.safeParse(rawFileId);

    if (!parsedId.success) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid file ID." } },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const parsedKind = kindSchema.safeParse(url.searchParams.get("kind") ?? "reference");
    const kind = parsedKind.success ? parsedKind.data : "reference";
    const jsonMode = url.searchParams.get("mode") === "json";

    const supabase = await createClient();

    let projectId = "";
    let bucket = "";
    let storagePath = "";
    let originalFilename = "download";
    let isCustomerAccessible = true;
    let currentDownloadCount = 0;

    if (kind === "deliverable") {
      const { data: deliverable } = await supabase
        .from("deliverables")
        .select("*")
        .eq("id", parsedId.data)
        .maybeSingle();

      if (!deliverable) {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_FOUND", message: "File not found." } },
          { status: 404 }
        );
      }

      projectId = deliverable.project_id;
      bucket = deliverable.bucket;
      storagePath = deliverable.storage_path;
      originalFilename = deliverable.original_filename;
      isCustomerAccessible = deliverable.is_customer_accessible;
      currentDownloadCount = deliverable.download_count;
      bucket = deliverable.bucket;
      storagePath = deliverable.storage_path;
      originalFilename = deliverable.original_filename;
      isCustomerAccessible = deliverable.is_customer_accessible;
    } else {
      const { data: projectFile } = await supabase
        .from("project_files")
        .select("*")
        .eq("id", parsedId.data)
        .maybeSingle();

      if (!projectFile) {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_FOUND", message: "File not found." } },
          { status: 404 }
        );
      }

      projectId = projectFile.project_id;
      bucket = projectFile.bucket;
      storagePath = projectFile.storage_path;
      originalFilename = projectFile.original_filename;
    }

    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to")
      .eq("id", projectId)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Associated project not found." } },
        { status: 404 }
      );
    }

    if (
      !canUserDownloadFile({
        actorId: actor.id,
        actorRole: actor.role,
        customerId: project.customer_id,
        assignedTo: project.assigned_to,
        kind,
        isCustomerAccessible,
      })
    ) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Access denied for this file." } },
        { status: 403 }
      );
    }

    if (!isValidStoragePrefixForProject(storagePath, project.id)) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Invalid file storage path." } },
        { status: 403 }
      );
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60, {
        download: originalFilename,
      });

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "DATABASE_ERROR", message: "Unable to generate download link." },
        },
        { status: 500 }
      );
    }

    if (kind === "deliverable" && actor.role === "customer" && isAdminSupabaseConfigured()) {
      await createAdminClient()
        .from("deliverables")
        .update({ download_count: currentDownloadCount + 1 })
        .eq("id", parsedId.data);
    }

    if (jsonMode) {
      return NextResponse.json(
        { ok: true, data: { signedUrl: signed.signedUrl } },
        { status: 200, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    return NextResponse.redirect(signed.signedUrl, {
      status: 307,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
