"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  categoryUpsertSchema,
  serviceFormFieldUpsertSchema,
  serviceUpsertSchema,
  type CategoryUpsertInput,
  type ServiceFormFieldUpsertInput,
  type ServiceUpsertInput,
} from "@/lib/validations/services";
import type { ActionResult } from "@/types";
import type { Json } from "@/types/database";

function invalidateCatalogCache(slug?: string) {
  updateTag("categories");
  updateTag("services");
  updateTag("forms");
  revalidatePath("/services");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/services/${slug}`);
  }
}

export async function upsertCategoryAction(
  rawInput: CategoryUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const parsed = categoryUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      icon_name: parsed.data.iconName || null,
      display_order: parsed.data.displayOrder,
      is_published: parsed.data.isPublished,
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("service_categories")
        .update(payload)
        .eq("id", parsed.data.id);
      if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "category.updated",
        entityType: "service_category",
        entityId: parsed.data.id,
        newValues: payload as unknown as Json,
      });

      invalidateCatalogCache();
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase
      .from("service_categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "category.created",
      entityType: "service_category",
      entityId: data.id,
      newValues: payload as unknown as Json,
    });

    invalidateCatalogCache();
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function toggleCategoryPublishAction(
  id: string,
  isPublished: boolean
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_categories")
      .update({ is_published: isPublished })
      .eq("id", id);

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isPublished ? "category.published" : "category.unpublished",
      entityType: "service_category",
      entityId: id,
    });

    invalidateCatalogCache();
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const supabase = await createClient();

    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)
      .is("deleted_at", null);

    if ((count ?? 0) > 0) {
      return fail(
        "CONFLICT",
        "Cannot delete a category that still has active services. Reassign or delete those services first."
      );
    }

    const { error } = await supabase
      .from("service_categories")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", id);

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "category.archived",
      entityType: "service_category",
      entityId: id,
    });

    invalidateCatalogCache();
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function upsertServiceAction(
  rawInput: ServiceUpsertInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const parsed = serviceUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      category_id: parsed.data.categoryId,
      title: parsed.data.title,
      slug: parsed.data.slug,
      short_description: parsed.data.shortDescription,
      full_description: parsed.data.fullDescription,
      deliverables: parsed.data.deliverables as unknown as Json,
      features: parsed.data.features as unknown as Json,
      tech_stack: parsed.data.techStack,
      estimated_timeline: parsed.data.estimatedTimeline || null,
      pricing_mode: parsed.data.pricingMode,
      starting_price_minor: parsed.data.startingPriceMinor ?? null,
      currency: parsed.data.currency,
      thumbnail_media_id: parsed.data.thumbnailMediaId ?? null,
      display_order: parsed.data.displayOrder,
      is_featured: parsed.data.isFeatured,
      is_published: parsed.data.isPublished,
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
    };

    if (parsed.data.id) {
      const { error } = await supabase.from("services").update(payload).eq("id", parsed.data.id);
      if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "service.updated",
        entityType: "service",
        entityId: parsed.data.id,
        newValues: { slug: payload.slug, is_published: payload.is_published },
      });

      invalidateCatalogCache(payload.slug);
      revalidatePath(`/admin/services/${parsed.data.id}`);
      return ok({ id: parsed.data.id, slug: payload.slug });
    }

    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select("id, slug")
      .single();
    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "service.created",
      entityType: "service",
      entityId: data.id,
      newValues: { slug: data.slug, is_published: payload.is_published },
    });

    invalidateCatalogCache(data.slug);
    return ok({ id: data.id, slug: data.slug });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function toggleServicePublishAction(
  id: string,
  isPublished: boolean
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .update({ is_published: isPublished })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isPublished ? "service.published" : "service.unpublished",
      entityType: "service",
      entityId: id,
    });

    invalidateCatalogCache(data.slug);
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("services.manage");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "service.archived",
      entityType: "service",
      entityId: id,
    });

    invalidateCatalogCache(data.slug);
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function upsertServiceFormFieldAction(
  rawInput: ServiceFormFieldUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("forms.manage");
    const parsed = serviceFormFieldUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      service_id: parsed.data.serviceId,
      field_key: parsed.data.fieldKey,
      label: parsed.data.label,
      field_type: parsed.data.fieldType,
      placeholder: parsed.data.placeholder || null,
      help_text: parsed.data.helpText || null,
      options: parsed.data.options as unknown as Json,
      validation_rules: parsed.data.validationRules as unknown as Json,
      is_required: parsed.data.isRequired,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("service_form_fields")
        .update(payload)
        .eq("id", parsed.data.id);
      if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "service_form_field.updated",
        entityType: "service_form_field",
        entityId: parsed.data.id,
        newValues: { service_id: payload.service_id, field_key: payload.field_key },
      });

      invalidateCatalogCache();
      revalidatePath(`/admin/services/${payload.service_id}/form`);
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase
      .from("service_form_fields")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "service_form_field.created",
      entityType: "service_form_field",
      entityId: data.id,
      newValues: { service_id: payload.service_id, field_key: payload.field_key },
    });

    invalidateCatalogCache();
    revalidatePath(`/admin/services/${payload.service_id}/form`);
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function reorderServiceFormFieldsAction(
  serviceId: string,
  orderedFieldIds: string[]
): Promise<ActionResult<{ updated: number }>> {
  try {
    const actor = await requirePermission("forms.manage");
    const supabase = await createClient();

    for (let i = 0; i < orderedFieldIds.length; i += 1) {
      const fieldId = orderedFieldIds[i];
      const { error } = await supabase
        .from("service_form_fields")
        .update({ display_order: i })
        .eq("id", fieldId)
        .eq("service_id", serviceId);
      if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "service_form_field.reordered",
      entityType: "service",
      entityId: serviceId,
      newValues: orderedFieldIds as unknown as Json,
    });

    invalidateCatalogCache();
    revalidatePath(`/admin/services/${serviceId}/form`);
    return ok({ updated: orderedFieldIds.length });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteServiceFormFieldAction(
  fieldId: string,
  serviceId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("forms.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_form_fields")
      .delete()
      .eq("id", fieldId)
      .eq("service_id", serviceId);

    if (error) return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "service_form_field.deleted",
      entityType: "service_form_field",
      entityId: fieldId,
    });

    invalidateCatalogCache();
    revalidatePath(`/admin/services/${serviceId}/form`);
    return ok({ id: fieldId });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
