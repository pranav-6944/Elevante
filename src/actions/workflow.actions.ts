"use server";

import { revalidatePath } from "next/cache";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { isAdminRole } from "@/lib/auth/rbac";
import {
  sendProjectMessageEmail,
  sendDeliverableReleasedEmail,
  sendQuotationResponseEmail,
} from "@/lib/email/resend";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fail, normalizeActionError, normalizeDatabaseError, ok } from "@/lib/utils/errors";
import {
  canCustomerRespondToQuotation,
  customerQuotationResponseSchema,
  deliverableVisibilitySchema,
  getNextProjectStatusAfterMessage,
  projectMessageSchema,
  validateMessageAuthorization,
  type CustomerQuotationResponseInput,
  type ProjectMessageInput,
} from "@/lib/validations/workflow";
import type { ActionResult } from "@/types";
import type { Json, ProjectStatus } from "@/types/database";

export async function respondToQuotationAction(
  rawInput: CustomerQuotationResponseInput
): Promise<ActionResult<{ quotationId: string; projectStatus: ProjectStatus }>> {
  try {
    const actor = await requireAuth();
    if (!isSupabaseConfigured() || !isAdminSupabaseConfigured()) {
      return fail(
        "CONFIGURATION_ERROR",
        "Supabase server credentials are required to process quotation responses."
      );
    }

    const parsed = customerQuotationResponseSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { data: quotation } = await supabase
      .from("quotations")
      .select("id, project_id, quote_number, status")
      .eq("id", parsed.data.quotationId)
      .maybeSingle();

    if (!quotation) {
      return fail("NOT_FOUND", "Quotation not found.");
    }

    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, project_code, title, status")
      .eq("id", quotation.project_id)
      .eq("customer_id", actor.id)
      .maybeSingle();

    if (!project) {
      return fail("FORBIDDEN", "You can only respond to quotations for your own projects.");
    }

    const stateCheck = canCustomerRespondToQuotation(quotation.status);
    if (!stateCheck.ok) {
      return fail("CONFLICT", stateCheck.message);
    }

    const nowIso = new Date().toISOString();
    const nextProjectStatus: ProjectStatus =
      parsed.data.decision === "accepted" ? "quote_accepted" : "under_review";

    const admin = createAdminClient();

    const { error: quoteUpdateErr } = await admin
      .from("quotations")
      .update({
        status: parsed.data.decision,
        customer_response_note: parsed.data.note || null,
        responded_at: nowIso,
      })
      .eq("id", quotation.id);

    if (quoteUpdateErr) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(quoteUpdateErr)) };
    }

    const { error: projUpdateErr } = await admin
      .from("project_requests")
      .update({ status: nextProjectStatus })
      .eq("id", project.id);

    if (projUpdateErr) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(projUpdateErr)) };
    }

    const statusNote =
      parsed.data.decision === "accepted"
        ? `Customer accepted quotation ${quotation.quote_number}.`
        : parsed.data.decision === "revision_requested"
          ? `Customer requested revision on ${quotation.quote_number}: ${parsed.data.note}`
          : `Customer declined quotation ${quotation.quote_number}.`;

    await Promise.allSettled([
      admin.from("project_status_history").insert({
        project_id: project.id,
        from_status: project.status,
        to_status: nextProjectStatus,
        changed_by: actor.id,
        note: statusNote,
      }),
      ...(project.assigned_to
        ? [
            admin.from("notifications").insert({
              user_id: project.assigned_to,
              type: "quotation_response",
              title: `Quotation ${parsed.data.decision.replaceAll("_", " ")} (${project.project_code})`,
              body: statusNote,
              link_url: `/admin/projects/${project.id}`,
              metadata: {
                project_id: project.id,
                quotation_id: quotation.id,
                decision: parsed.data.decision,
              },
            }),
          ]
        : []),
      recordAuditLog({
        actorId: actor.id,
        actorEmail: actor.email,
        action: `quotation.${parsed.data.decision}`,
        entityType: "quotation",
        entityId: quotation.id,
        oldValues: { status: quotation.status } as unknown as Json,
        newValues: {
          status: parsed.data.decision,
          project_status: nextProjectStatus,
        } as unknown as Json,
      }),
      sendQuotationResponseEmail({
        recipientEmail: actor.email,
        projectCode: project.project_code,
        quoteNumber: quotation.quote_number,
        projectTitle: project.title,
        decision: parsed.data.decision,
        note: parsed.data.note,
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${project.id}`);
    revalidatePath("/admin/quotations");

    return ok({ quotationId: quotation.id, projectStatus: nextProjectStatus });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function postProjectMessageAction(
  rawInput: ProjectMessageInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth();
    if (!isSupabaseConfigured()) {
      return fail("CONFIGURATION_ERROR", "Supabase environment is not configured.");
    }

    const parsed = projectMessageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, project_code, title, status")
      .eq("id", parsed.data.projectId)
      .maybeSingle();

    if (!project) {
      return fail("NOT_FOUND", "Project not found.");
    }

    const authCheck = validateMessageAuthorization({
      actorId: actor.id,
      actorRole: actor.role,
      customerId: project.customer_id,
      assignedTo: project.assigned_to,
      projectStatus: project.status,
      messageType: parsed.data.messageType,
      isInternalNote: parsed.data.isInternalNote,
    });

    if (!authCheck.ok) {
      return fail("FORBIDDEN", authCheck.message);
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("project_messages")
      .insert({
        project_id: project.id,
        sender_id: actor.id,
        message_type: parsed.data.messageType,
        body: parsed.data.body,
        is_internal_note: parsed.data.isInternalNote,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(insertErr)) };
    }

    const nextStatus = getNextProjectStatusAfterMessage({
      currentStatus: project.status,
      messageType: parsed.data.messageType,
      isInternalNote: parsed.data.isInternalNote,
      actorRole: actor.role,
    });

    if (isAdminSupabaseConfigured()) {
      const admin = createAdminClient();
      const tasks: Array<PromiseLike<unknown>> = [
        recordAuditLog({
          actorId: actor.id,
          actorEmail: actor.email,
          action: parsed.data.isInternalNote
            ? "project_message.internal_note"
            : "project_message.posted",
          entityType: "project_request",
          entityId: project.id,
          newValues: {
            message_id: inserted.id,
            message_type: parsed.data.messageType,
            is_internal_note: parsed.data.isInternalNote,
          } as unknown as Json,
        }),
      ];

      if (nextStatus && nextStatus !== project.status) {
        tasks.push(
          admin.from("project_requests").update({ status: nextStatus }).eq("id", project.id),
          admin.from("project_status_history").insert({
            project_id: project.id,
            from_status: project.status,
            to_status: nextStatus,
            changed_by: actor.id,
            note:
              nextStatus === "clarification_needed"
                ? "Team requested clarification from client."
                : "Client responded to clarification request.",
          })
        );
      }

      if (!parsed.data.isInternalNote) {
        if (actor.role !== "customer") {
          const { data: custProfile } = await admin
            .from("profiles")
            .select("email")
            .eq("id", project.customer_id)
            .maybeSingle();

          tasks.push(
            admin.from("notifications").insert({
              user_id: project.customer_id,
              type: parsed.data.messageType,
              title:
                parsed.data.messageType === "clarification_request"
                  ? `Clarification Requested (${project.project_code})`
                  : `New Message on ${project.project_code}`,
              body: parsed.data.body.slice(0, 180),
              link_url: `/dashboard/projects/${project.id}`,
              metadata: { project_id: project.id, message_id: inserted.id },
            })
          );

          if (custProfile?.email) {
            tasks.push(
              sendProjectMessageEmail({
                recipientEmail: custProfile.email,
                projectCode: project.project_code,
                projectTitle: project.title,
                senderName: actor.fullName,
                messageType: parsed.data.messageType,
                body: parsed.data.body,
              })
            );
          }
        } else if (project.assigned_to) {
          tasks.push(
            admin.from("notifications").insert({
              user_id: project.assigned_to,
              type: parsed.data.messageType,
              title: `Client Reply on ${project.project_code}`,
              body: parsed.data.body.slice(0, 180),
              link_url: `/admin/projects/${project.id}`,
              metadata: { project_id: project.id, message_id: inserted.id },
            })
          );
        }
      }

      await Promise.allSettled(tasks);
    }

    revalidatePath(`/dashboard/projects/${project.id}`);
    revalidatePath("/dashboard/notifications");
    revalidatePath(`/admin/projects/${project.id}`);
    revalidatePath("/admin/projects");
    revalidatePath("/dashboard/projects");

    return ok({ id: inserted.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}

export async function toggleDeliverableVisibilityAction(
  deliverableId: string,
  isCustomerAccessible: boolean
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireAuth();
    if (!isAdminRole(actor.role) && actor.role !== "staff") {
      return fail("FORBIDDEN", "Only agency team members can manage deliverable releases.");
    }

    const parsed = deliverableVisibilitySchema.safeParse({ deliverableId, isCustomerAccessible });
    if (!parsed.success) {
      return { ok: false, error: normalizeActionError(parsed.error) };
    }

    const supabase = await createClient();
    const { data: deliverable } = await supabase
      .from("deliverables")
      .select("id, project_id, title, version_label, is_customer_accessible")
      .eq("id", parsed.data.deliverableId)
      .maybeSingle();

    if (!deliverable) {
      return fail("NOT_FOUND", "Deliverable not found.");
    }

    const { data: project } = await supabase
      .from("project_requests")
      .select("id, customer_id, assigned_to, project_code, title")
      .eq("id", deliverable.project_id)
      .maybeSingle();

    if (!project) {
      return fail("NOT_FOUND", "Associated project not found.");
    }

    if (!isAdminRole(actor.role) && project.assigned_to !== actor.id) {
      return fail("FORBIDDEN", "Staff can only manage deliverables on assigned projects.");
    }

    const { error } = await supabase
      .from("deliverables")
      .update({ is_customer_accessible: parsed.data.isCustomerAccessible })
      .eq("id", deliverable.id);

    if (error) {
      return { ok: false, error: normalizeActionError(normalizeDatabaseError(error)) };
    }

    if (isAdminSupabaseConfigured()) {
      const admin = createAdminClient();
      const tasks: Array<PromiseLike<unknown>> = [
        recordAuditLog({
          actorId: actor.id,
          actorEmail: actor.email,
          action: parsed.data.isCustomerAccessible ? "deliverable.released" : "deliverable.hidden",
          entityType: "deliverable",
          entityId: deliverable.id,
        }),
      ];

      if (!deliverable.is_customer_accessible && parsed.data.isCustomerAccessible) {
        tasks.push(
          admin.from("notifications").insert({
            user_id: project.customer_id,
            type: "deliverable_released",
            title: `Deliverable Ready (${project.project_code})`,
            body: `"${deliverable.title}" (${deliverable.version_label}) is ready for download in your portal.`,
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
              deliverableTitle: deliverable.title,
              versionLabel: deliverable.version_label,
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

    return ok({ id: deliverable.id });
  } catch (error) {
    return { ok: false, error: normalizeActionError(error) };
  }
}
