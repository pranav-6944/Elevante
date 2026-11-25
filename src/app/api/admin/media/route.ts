import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminSupabaseConfigured } from "@/config/env";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, normalizeActionError, normalizeDatabaseError } from "@/lib/utils/errors";
import type { MediaType } from "@/types/database";

const MAX_PUBLIC_MEDIA_BYTES = 52_428_800; // 50 MB matching Storage bucket policy
const ALLOWED_MIME_TYPES = new Map<string, MediaType>([
  ["image/png", "image"],
  ["image/jpeg", "image"],
  ["image/webp", "image"],
  ["image/avif", "image"],
  ["video/mp4", "video"],
  ["video/webm", "video"],
  ["application/pdf", "document"],
]);

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("media.manage");

    if (!isAdminSupabaseConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CONFIGURATION_ERROR",
            message: "Supabase server credentials are required for media uploads.",
          },
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const altText = String(formData.get("altText") ?? "")
      .trim()
      .slice(0, 240);
    const caption = String(formData.get("caption") ?? "")
      .trim()
      .slice(0, 400);

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "No file uploaded." } },
        { status: 400 }
      );
    }

    const mediaType = ALLOWED_MIME_TYPES.get(file.type);
    if (!mediaType) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Unsupported file type. Allowed: PNG, JPG, WebP, AVIF, MP4, WebM, PDF.",
          },
        },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_PUBLIC_MEDIA_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "File must be larger than 0 bytes and under 50 MB.",
          },
        },
        { status: 413 }
      );
    }

    const safeName = sanitizeFilename(file.name) || "upload";
    const storagePath = `cms/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("public-media")
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: { code: "DATABASE_ERROR", message: "Storage upload failed." } },
        { status: 500 }
      );
    }

    const { data: urlData } = admin.storage.from("public-media").getPublicUrl(storagePath);

    const { data: record, error: dbError } = await admin
      .from("media_assets")
      .insert({
        bucket: "public-media",
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        media_type: mediaType,
        alt_text: altText || null,
        caption: caption || null,
        uploaded_by: actor.id,
      })
      .select("*")
      .single();

    if (dbError) {
      await admin.storage.from("public-media").remove([storagePath]);
      throw normalizeDatabaseError(dbError);
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "media_asset.uploaded",
      entityType: "media_asset",
      entityId: record.id,
      newValues: { storage_path: storagePath, mime_type: file.type, file_size: file.size },
    });

    revalidateTag("cms", "max");
    return NextResponse.json({ ok: true, data: record }, { status: 201 });
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
