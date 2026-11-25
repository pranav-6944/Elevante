"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  faqUpsertSchema,
  siteSectionUpsertSchema,
  type FaqUpsertInput,
  type SiteSectionUpsertInput,
} from "@/lib/validations/services";
import type { ActionResult } from "@/types";
import type { Json } from "@/types/database";

export async function upsertFaqAction(
  rawInput: FaqUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("cms.manage");
    const parsed = faqUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      category: parsed.data.category,
      service_id: parsed.data.serviceId ?? null,
      question: parsed.data.question,
      answer: parsed.data.answer,
      display_order: parsed.data.displayOrder,
      is_published: parsed.data.isPublished,
    };

    if (parsed.data.id) {
      const { error } = await supabase.from("faqs").update(payload).eq("id", parsed.data.id);
      if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "faq.updated",
        entityType: "faq",
        entityId: parsed.data.id,
      });

      updateTag("faqs");
      revalidatePath("/faq");
      revalidatePath("/admin/content");
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase.from("faqs").insert(payload).select("id").single();
    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "faq.created",
      entityType: "faq",
      entityId: data.id,
    });

    updateTag("faqs");
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("cms.manage");
    const supabase = await createClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "faq.deleted",
      entityType: "faq",
      entityId: id,
    });

    updateTag("faqs");
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function upsertSiteSectionAction(
  rawInput: SiteSectionUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("cms.manage");
    const parsed = siteSectionUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    let content: Json = {};
    let seoMetadata: Json = {};
    try {
      content = JSON.parse(parsed.data.contentJson) as Json;
      seoMetadata = JSON.parse(parsed.data.seoMetadataJson) as Json;
    } catch {
      return fail("VALIDATION_ERROR", "Content and SEO fields must contain valid JSON.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_sections")
      .upsert(
        {
          page_key: parsed.data.pageKey,
          section_key: parsed.data.sectionKey,
          title: parsed.data.title || null,
          subtitle: parsed.data.subtitle || null,
          content,
          seo_metadata: seoMetadata,
          is_published: parsed.data.isPublished,
          updated_by: actor.id,
        },
        { onConflict: "page_key,section_key" }
      )
      .select("id")
      .single();

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "site_section.upserted",
      entityType: "site_section",
      entityId: data.id,
      newValues: { page_key: parsed.data.pageKey, section_key: parsed.data.sectionKey },
    });

    updateTag("cms");
    revalidatePath("/");
    revalidatePath("/admin/content");
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteMediaAssetAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("media.manage");
    const supabase = await createClient();

    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("id, bucket, storage_path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(fetchError)) };
    }
    if (!asset) {
      return fail("NOT_FOUND", "Media asset not found.");
    }

    const admin = createAdminClient();
    const { error: storageError } = await admin.storage
      .from(asset.bucket)
      .remove([asset.storage_path]);
    if (storageError) {
      return fail("DATABASE_ERROR", "Could not remove file from storage bucket.");
    }

    const { error: dbError } = await supabase.from("media_assets").delete().eq("id", id);
    if (dbError) return { ok: false, error: normalizeActionError(normalizeDatabaseError(dbError)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "media_asset.deleted",
      entityType: "media_asset",
      entityId: id,
      oldValues: { storage_path: asset.storage_path },
    });

    updateTag("cms");
    revalidatePath("/admin/media");
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
