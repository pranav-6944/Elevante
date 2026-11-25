"use server";

import { revalidatePath } from "next/cache";
import { isAdminSupabaseConfigured } from "@/config/env";
import { requireAuth, requirePermission } from "@/lib/auth/guards";
import { isAdminRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  adminProjectUpdateSchema,
  calculateQuotationTotals,
  canActorToggleProfileStatus,
  enquiryUpdateSchema,
  quotationUpsertSchema,
  toggleCustomerActiveSchema,
  type AdminProjectUpdateInput,
  type EnquiryUpdateInput,
  type QuotationUpsertInput,
} from "@/lib/validations/admin";
import type { ActionResult, UserRole } from "@/types";
import type { Json } from "@/types/database";

export async function updateEnquiryAction(
  rawInput: EnquiryUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("enquiries.manage");
    const parsed = enquiryUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("enquiries")
      .select("status, assigned_to")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) {
      return fail("NOT_FOUND", "Enquiry record not found.");
    }

    const { error } = await supabase
      .from("enquiries")
      .update({
        status: parsed.data.status,
        assigned_to: parsed.data.assignedTo || null,
        internal_notes: parsed.data.internalNotes || null,
      })
      .eq("id", parsed.data.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "enquiry.updated",
      entityType: "enquiry",
      entityId: parsed.data.id,
      oldValues: existing as unknown as Json,
      newValues: {
        status: parsed.data.status,
        assigned_to: parsed.data.assignedTo || null,
      } as unknown as Json,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/enquiries");
    return ok({ id: parsed.data.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function toggleCustomerActiveAction(
  userId: string,
  isActive: boolean
): Promise<ActionResult<{ userId: string }>> {
  try {
    const actor = await requirePermission("projects.read_all");
    const parsed = toggleCustomerActiveSchema.safeParse({ userId, isActive });
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const [{ data: target }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, role_id, is_active")
        .eq("id", parsed.data.userId)
        .maybeSingle(),
      supabase.from("roles").select("id, slug"),
    ]);

    if (!target) {
      return fail("NOT_FOUND", "Customer account not found.");
    }

    const targetRole = ((roles ?? []).find((r) => r.id === target.role_id)?.slug ??
      "customer") as UserRole;

    const check = canActorToggleProfileStatus({
      actorId: actor.id,
      actorRole: actor.role,
      targetUserId: target.id,
      targetCurrentRole: targetRole,
    });
    if (!check.ok) {
      return fail("FORBIDDEN", check.message);
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: parsed.data.isActive })
      .eq("id", target.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: parsed.data.isActive ? "customer.activated" : "customer.deactivated",
      entityType: "profile",
      entityId: target.id,
      oldValues: { is_active: target.is_active } as unknown as Json,
      newValues: { is_active: parsed.data.isActive } as unknown as Json,
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin");
    return ok({ userId: target.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function updateAdminProjectAction(
  rawInput: AdminProjectUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth();
    const isFullAdmin = isAdminRole(actor.role);

    if (!isFullAdmin && actor.role !== "staff") {
      return fail("FORBIDDEN", "Only authorized team members can update project workflows.");
    }

    const parsed = adminProjectUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, status, priority, project_code, title")
      .eq("id", parsed.data.projectId)
      .maybeSingle();

    if (!project) {
      return fail("NOT_FOUND", "Project not found.");
    }

    if (!isFullAdmin && project.assigned_to !== actor.id) {
      return fail("FORBIDDEN", "Staff can only update projects assigned to them.");
    }

    if (isFullAdmin) {
      await requirePermission("projects.manage");
    }

    const updateFields: DatabaseUpdateProject = {
      status: parsed.data.status,
      priority: parsed.data.priority,
      completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null,
      ...(isFullAdmin ? { assigned_to: parsed.data.assignedTo || null } : {}),
    };

    const { error } = await supabase
      .from("project_requests")
      .update(updateFields)
      .eq("id", project.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    const statusChanged = project.status !== parsed.data.status;
    if ((statusChanged || parsed.data.note) && isAdminSupabaseConfigured()) {
      const admin = createAdminClient();
      await admin.from("project_status_history").insert({
        project_id: project.id,
        from_status: project.status,
        to_status: parsed.data.status,
        changed_by: actor.id,
        note: parsed.data.note || null,
      });

      if (statusChanged) {
        await admin.from("notifications").insert({
          user_id: project.customer_id,
          type: "project_status_updated",
          title: `Project Status Updated (${project.project_code})`,
          body: `"${project.title}" moved to ${parsed.data.status.replaceAll("_", " ")}.`,
          link_url: `/dashboard/projects/${project.id}`,
          metadata: {
            project_id: project.id,
            status: parsed.data.status,
          },
        });
      }
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "project_request.updated",
      entityType: "project_request",
      entityId: project.id,
      oldValues: {
        status: project.status,
        priority: project.priority,
        assigned_to: project.assigned_to,
      } as unknown as Json,
      newValues: {
        status: parsed.data.status,
        priority: parsed.data.priority,
        assigned_to: isFullAdmin ? parsed.data.assignedTo || null : project.assigned_to,
      } as unknown as Json,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${project.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/dashboard/notifications");

    return ok({ id: project.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

type DatabaseUpdateProject = {
  status: AdminProjectUpdateInput["status"];
  priority: AdminProjectUpdateInput["priority"];
  completed_at: string | null;
  assigned_to?: string | null;
};

export async function upsertQuotationAction(
  rawInput: QuotationUpsertInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requirePermission("quotations.manage");
    const parsed = quotationUpsertSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const totals = calculateQuotationTotals(
      parsed.data.items,
      parsed.data.discountMinor,
      parsed.data.taxMinor
    );
    if (!totals.ok) {
      return fail("VALIDATION_ERROR", totals.message);
    }

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, project_code, title, status")
      .eq("id", parsed.data.projectId)
      .maybeSingle();

    if (!project) {
      return fail("NOT_FOUND", "Target project not found.");
    }

    let quotationId = parsed.data.id || "";
    const targetStatus = parsed.data.dispatchNow ? "sent" : "draft";
    const nowIso = new Date().toISOString();

    if (quotationId) {
      const { data: existingQuote } = await supabase
        .from("quotations")
        .select("id, status")
        .eq("id", quotationId)
        .maybeSingle();

      if (!existingQuote) {
        return fail("NOT_FOUND", "Quotation not found.");
      }
      if (existingQuote.status === "accepted") {
        return fail("CONFLICT", "Accepted quotations are locked; create a new version instead.");
      }

      const { error: updateErr } = await supabase
        .from("quotations")
        .update({
          title: parsed.data.title,
          scope_summary: parsed.data.scopeSummary,
          subtotal_minor: totals.subtotalMinor,
          discount_minor: totals.discountMinor,
          tax_minor: totals.taxMinor,
          total_minor: totals.totalMinor,
          currency: parsed.data.currency,
          estimated_duration: parsed.data.estimatedDuration || null,
          valid_until: parsed.data.validUntil || null,
          terms: parsed.data.terms || null,
          status: targetStatus,
          ...(parsed.data.dispatchNow ? { sent_at: nowIso } : {}),
        })
        .eq("id", quotationId);

      if (updateErr) {
        return { ok: false, error: normalizeActionError(normalizeDatabaseError(updateErr)) };
      }

      await supabase.from("quotation_items").delete().eq("quotation_id", quotationId);
    } else {
      const { data: latest } = await supabase
        .from("quotations")
        .select("version")
        .eq("project_id", project.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (latest?.version ?? 0) + 1;

      const { data: inserted, error: insertErr } = await supabase
        .from("quotations")
        .insert({
          project_id: project.id,
          version: nextVersion,
          title: parsed.data.title,
          scope_summary: parsed.data.scopeSummary,
          subtotal_minor: totals.subtotalMinor,
          discount_minor: totals.discountMinor,
          tax_minor: totals.taxMinor,
          total_minor: totals.totalMinor,
          currency: parsed.data.currency,
          estimated_duration: parsed.data.estimatedDuration || null,
          valid_until: parsed.data.validUntil || null,
          terms: parsed.data.terms || null,
          status: targetStatus,
          created_by: actor.id,
          ...(parsed.data.dispatchNow ? { sent_at: nowIso } : {}),
        })
        .select("id")
        .single();

      if (insertErr || !inserted) {
        return { ok: false, error: normalizeActionError(normalizeDatabaseError(insertErr)) };
      }
      quotationId = inserted.id;
    }

    const { error: itemsErr } = await supabase.from("quotation_items").insert(
      totals.computedItems.map((item, idx) => ({
        quotation_id: quotationId,
        title: item.title,
        description: item.description || null,
        quantity: item.quantity,
        unit_price_minor: item.unitPriceMinor,
        line_total_minor: item.lineTotalMinor,
        display_order: idx,
      }))
    );

    if (itemsErr) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(itemsErr)) };
    }

    if (parsed.data.dispatchNow) {
      if (["submitted", "under_review", "clarification_needed"].includes(project.status)) {
        await supabase.from("project_requests").update({ status: "quoted" }).eq("id", project.id);
      }

      if (isAdminSupabaseConfigured()) {
        const admin = createAdminClient();
        await Promise.allSettled([
          admin.from("project_status_history").insert({
            project_id: project.id,
            from_status: project.status,
            to_status: "quoted",
            changed_by: actor.id,
            note: `Quotation "${parsed.data.title}" dispatched to customer.`,
          }),
          admin.from("notifications").insert({
            user_id: project.customer_id,
            type: "quotation_sent",
            title: `New Quotation Available (${project.project_code})`,
            body: `A formal quotation for "${project.title}" has been issued in your Customer Portal.`,
            link_url: `/dashboard/projects/${project.id}`,
            metadata: { project_id: project.id, quotation_id: quotationId },
          }),
        ]);
      }
    }

    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: parsed.data.dispatchNow ? "quotation.dispatched" : "quotation.saved",
      entityType: "quotation",
      entityId: quotationId,
      newValues: {
        project_id: project.id,
        status: targetStatus,
        total_minor: totals.totalMinor,
        currency: parsed.data.currency,
      } as unknown as Json,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/quotations");
    revalidatePath(`/admin/projects/${project.id}`);
    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/dashboard/notifications");

    return ok({ id: quotationId });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
