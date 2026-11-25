"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createClient } from "@/lib/supabase/server";
import { normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  portfolioUpsertSchema,
  testimonialUpsertSchema,
  type PortfolioUpsertInput,
  type TestimonialUpsertInput,
} from "@/lib/validations/admin";
import type { ActionResult } from "@/types";
import type { Json } from "@/types/database";

function invalidatePortfolioCache(slug?: string) {
  updateTag("portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function upsertPortfolioProjectAction(
  rawInput: PortfolioUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("portfolio.manage");
    const parsed = portfolioUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      service_id: parsed.data.serviceId || null,
      title: parsed.data.title,
      slug: parsed.data.slug,
      client_name: parsed.data.clientName || null,
      industry: parsed.data.industry || null,
      summary: parsed.data.summary,
      challenge: parsed.data.challenge || null,
      solution: parsed.data.solution || null,
      outcomes: parsed.data.outcomes as unknown as Json,
      tech_stack: parsed.data.techStack,
      live_url: parsed.data.liveUrl || null,
      cover_media_id: parsed.data.coverMediaId || null,
      display_order: parsed.data.displayOrder,
      is_featured: parsed.data.isFeatured,
      is_published: parsed.data.isPublished,
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("portfolio_projects")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
      }

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portfolio.updated",
        entityType: "portfolio_project",
        entityId: parsed.data.id,
        newValues: {
          slug: parsed.data.slug,
          is_published: parsed.data.isPublished,
        } as unknown as Json,
      });

      invalidatePortfolioCache(parsed.data.slug);
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "portfolio.created",
      entityType: "portfolio_project",
      entityId: data.id,
      newValues: {
        slug: parsed.data.slug,
        is_published: parsed.data.isPublished,
      } as unknown as Json,
    });

    invalidatePortfolioCache(parsed.data.slug);
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function togglePortfolioPublishAction(
  id: string,
  slug: string,
  isPublished: boolean
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("portfolio.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("portfolio_projects")
      .update({ is_published: isPublished })
      .eq("id", id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: isPublished ? "portfolio.published" : "portfolio.unpublished",
      entityType: "portfolio_project",
      entityId: id,
    });

    invalidatePortfolioCache(slug);
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deletePortfolioProjectAction(
  id: string,
  slug: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("portfolio.manage");
    const supabase = await createClient();
    const { error } = await supabase
      .from("portfolio_projects")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "portfolio.archived",
      entityType: "portfolio_project",
      entityId: id,
    });

    invalidatePortfolioCache(slug);
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function upsertTestimonialAction(
  rawInput: TestimonialUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("cms.manage");
    const parsed = testimonialUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const payload = {
      portfolio_project_id: parsed.data.portfolioProjectId || null,
      author_name: parsed.data.authorName,
      author_role: parsed.data.authorRole || null,
      company: parsed.data.company || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating ?? null,
      display_order: parsed.data.displayOrder,
      is_featured: parsed.data.isFeatured,
      is_published: parsed.data.isPublished,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
      }

      await recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "testimonial.updated",
        entityType: "testimonial",
        entityId: parsed.data.id,
      });

      updateTag("testimonials");
      revalidatePath("/");
      revalidatePath("/admin/portfolio");
      revalidatePath("/admin/content");
      return ok({ id: parsed.data.id });
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "testimonial.created",
      entityType: "testimonial",
      entityId: data.id,
    });

    updateTag("testimonials");
    revalidatePath("/");
    revalidatePath("/admin/portfolio");
    revalidatePath("/admin/content");
    return ok({ id: data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("cms.manage");
    const supabase = await createClient();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "testimonial.deleted",
      entityType: "testimonial",
      entityId: id,
    });

    updateTag("testimonials");
    revalidatePath("/");
    revalidatePath("/admin/portfolio");
    revalidatePath("/admin/content");
    return ok({ id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
