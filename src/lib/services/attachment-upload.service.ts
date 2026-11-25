import "server-only";
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, normalizeDatabaseError } from "@/lib/utils/errors";
import {
  buildProjectAttachmentPath,
  MAX_ATTACHMENTS_PER_REQUEST,
  validateAttachmentMeta,
} from "@/lib/validations/projects";
import type { Database } from "@/types/database";

export interface ValidatedAttachmentFile {
  file: File;
  safeName: string;
  fieldKey: string | null;
}

export function parseAndValidateAttachmentFiles(
  formData: FormData,
  maxFiles = MAX_ATTACHMENTS_PER_REQUEST
): ValidatedAttachmentFile[] {
  const entries = [...formData.getAll("files"), ...formData.getAll("file")].filter(
    (item): item is File => item instanceof File && item.size > 0
  );

  if (entries.length > maxFiles) {
    throw new AppError(
      "VALIDATION_ERROR",
      `You can upload at most ${maxFiles} files per submission.`,
      400
    );
  }

  let fieldKeys: string[] = [];
  const rawKeys = formData.get("fileFieldKeys");
  if (typeof rawKeys === "string" && rawKeys.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawKeys) as unknown;
      if (Array.isArray(parsed)) {
        fieldKeys = parsed.map((k) => (typeof k === "string" ? k.trim() : ""));
      }
    } catch {
      throw new AppError("VALIDATION_ERROR", "Invalid file metadata mapping.", 400);
    }
  }

  return entries.map((file, idx) => {
    const check = validateAttachmentMeta({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!check.ok) {
      throw new AppError("VALIDATION_ERROR", check.message, 400);
    }

    const mappedKey = fieldKeys[idx];
    return {
      file,
      safeName: check.safeName,
      fieldKey: mappedKey && mappedKey !== "_reference" ? mappedKey : null,
    };
  });
}

export async function uploadProjectAttachments({
  supabase,
  projectId,
  uploaderUid,
  files,
}: {
  supabase: SupabaseClient<Database>;
  projectId: string;
  uploaderUid: string;
  files: ValidatedAttachmentFile[];
}): Promise<Database["public"]["Tables"]["project_files"]["Row"][]> {
  if (files.length === 0) return [];

  const uploadedPaths: string[] = [];
  const insertedRecords: Database["public"]["Tables"]["project_files"]["Row"][] = [];

  try {
    for (const item of files) {
      const storagePath = buildProjectAttachmentPath(
        projectId,
        uploaderUid,
        item.safeName,
        crypto.randomUUID()
      );
      const bytes = new Uint8Array(await item.file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("project-attachments")
        .upload(storagePath, bytes, {
          contentType: item.file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new AppError("DATABASE_ERROR", `Failed to store ${item.safeName}.`, 500);
      }

      uploadedPaths.push(storagePath);

      const { data: row, error: dbError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          uploaded_by: uploaderUid,
          bucket: "project-attachments",
          storage_path: storagePath,
          original_filename: item.file.name.slice(0, 200),
          mime_type: item.file.type,
          file_size: item.file.size,
          purpose: "reference",
        })
        .select("*")
        .single();

      if (dbError || !row) {
        throw normalizeDatabaseError(dbError, `Failed to register file ${item.safeName}.`);
      }

      insertedRecords.push(row);
    }

    return insertedRecords;
  } catch (error) {
    if (insertedRecords.length > 0) {
      await supabase
        .from("project_files")
        .delete()
        .in(
          "id",
          insertedRecords.map((r) => r.id)
        );
    }
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("project-attachments").remove(uploadedPaths);
    }
    throw error;
  }
}
