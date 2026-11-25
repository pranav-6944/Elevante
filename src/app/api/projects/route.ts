import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminSupabaseConfigured, isSupabaseConfigured } from "@/config/env";
import { requireAuth } from "@/lib/auth/guards";
import { sendProjectSubmittedEmails } from "@/lib/email/resend";
import { extractClientIp } from "@/lib/security/ip";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  parseAndValidateAttachmentFiles,
  uploadProjectAttachments,
} from "@/lib/services/attachment-upload.service";
import { recordAuditLog } from "@/lib/services/audit.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AppError, normalizeActionError, normalizeDatabaseError } from "@/lib/utils/errors";
import {
  parseFieldOptions,
  parseValidationRules,
  validateDynamicBriefSubmission,
  type DynamicFieldSpec,
} from "@/lib/validations/dynamic-form";
import { createProjectRequestSchema } from "@/lib/validations/projects";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
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

    if (isAdminSupabaseConfigured()) {
      await enforceRateLimit({
        key: `project-submit:${actor.id}`,
        maxRequests: 10,
        windowSeconds: 3600,
      });
    }

    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Missing project payload." } },
        { status: 400 }
      );
    }

    let decodedPayload: unknown;
    try {
      decodedPayload = JSON.parse(rawPayload);
    } catch {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Malformed JSON payload." } },
        { status: 400 }
      );
    }

    const parsed = createProjectRequestSchema.safeParse(decodedPayload);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: normalizeActionError(parsed.error) },
        { status: 400 }
      );
    }

    // Validate all attached files upfront before creating any database rows
    const validatedFiles = parseAndValidateAttachmentFiles(formData);

    const supabase = await createClient();
    const { data: service } = await supabase
      .from("services")
      .select("id, category_id, title, slug, is_published, deleted_at")
      .eq("id", parsed.data.serviceId)
      .eq("is_published", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (!service) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Selected service is unavailable." },
        },
        { status: 404 }
      );
    }

    const [{ data: category }, { data: rawFields }] = await Promise.all([
      supabase
        .from("service_categories")
        .select("id")
        .eq("id", service.category_id)
        .eq("is_published", true)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("service_form_fields")
        .select("*")
        .eq("service_id", service.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
    ]);

    if (!category) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Selected service category is unavailable." },
        },
        { status: 404 }
      );
    }

    const fieldSpecs: DynamicFieldSpec[] = (rawFields ?? []).map((f) => ({
      id: f.id,
      fieldKey: f.field_key,
      label: f.label,
      fieldType: f.field_type,
      placeholder: f.placeholder,
      helpText: f.help_text,
      options: parseFieldOptions(f.options),
      validationRules: parseValidationRules(f.validation_rules),
      isRequired: f.is_required,
      displayOrder: f.display_order,
      isActive: f.is_active,
    }));

    // Merge real uploaded attachment names into dynamic file-type fields
    const dynamicInput: Record<string, unknown> = { ...parsed.data.dynamicResponses };
    for (const spec of fieldSpecs) {
      if (spec.fieldType === "file") {
        const matchedNames = validatedFiles
          .filter((f) => f.fieldKey === spec.fieldKey)
          .map((f) => f.safeName);
        if (matchedNames.length > 0) {
          dynamicInput[spec.fieldKey] = matchedNames;
        } else if (!Array.isArray(dynamicInput[spec.fieldKey])) {
          dynamicInput[spec.fieldKey] = [];
        }
      }
    }

    const briefValidation = validateDynamicBriefSubmission(fieldSpecs, dynamicInput);
    if (!briefValidation.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please review the service brief fields and fix highlighted errors.",
            fieldErrors: briefValidation.fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("project_requests")
      .insert({
        customer_id: actor.id,
        service_id: service.id,
        title: parsed.data.title,
        summary: parsed.data.summary,
        status: "submitted",
        priority: parsed.data.priority,
        desired_deadline: parsed.data.desiredDeadline || null,
        budget_range: parsed.data.budgetRange || null,
        form_schema_snapshot: briefValidation.schemaSnapshot as unknown as Json,
      })
      .select("id, project_code")
      .single();

    if (projectError || !project) {
      throw normalizeDatabaseError(projectError, "Could not submit your project request.");
    }

    if (briefValidation.responses.length > 0) {
      const responseRows = briefValidation.responses.map((resp) => ({
        project_id: project.id,
        field_id: resp.fieldId,
        field_key: resp.fieldKey,
        field_label: resp.fieldLabel,
        field_type: resp.fieldType,
        response_value: resp.responseValue,
        display_order: resp.displayOrder,
      }));

      const { error: responsesError } = await supabase
        .from("project_form_responses")
        .insert(responseRows);

      if (responsesError) {
        await supabase.from("project_requests").delete().eq("id", project.id);
        throw normalizeDatabaseError(responsesError, "Could not store brief responses.");
      }
    }

    if (validatedFiles.length > 0) {
      try {
        await uploadProjectAttachments({
          supabase,
          projectId: project.id,
          uploaderUid: actor.id,
          files: validatedFiles,
        });
      } catch (uploadError) {
        if (isAdminSupabaseConfigured()) {
          await createAdminClient().from("project_requests").delete().eq("id", project.id);
        } else {
          await supabase.from("project_requests").delete().eq("id", project.id);
        }
        throw uploadError;
      }
    }

    if (isAdminSupabaseConfigured()) {
      const admin = createAdminClient();
      const clientIp = extractClientIp(request.headers);

      await Promise.allSettled([
        admin.from("project_status_history").insert({
          project_id: project.id,
          from_status: null,
          to_status: "submitted",
          changed_by: actor.id,
          note: "Project request submitted through Customer Portal.",
        }),
        admin.from("notifications").insert({
          user_id: actor.id,
          type: "project_submitted",
          title: `Project Request Submitted (${project.project_code})`,
          body: `Your brief for "${parsed.data.title}" (${service.title}) is now under review.`,
          link_url: `/dashboard/projects/${project.id}`,
          metadata: { project_id: project.id, project_code: project.project_code },
        }),
        recordAuditLog({
          actorId: actor.id,
          actorEmail: actor.email,
          action: "project_request.created",
          entityType: "project_request",
          entityId: project.id,
          newValues: {
            project_code: project.project_code,
            service_id: service.id,
            title: parsed.data.title,
            attachment_count: validatedFiles.length,
          } as unknown as Json,
          ipAddress: clientIp,
          userAgent: request.headers.get("user-agent"),
        }),
        sendProjectSubmittedEmails({
          projectCode: project.project_code,
          projectTitle: parsed.data.title,
          serviceTitle: service.title,
          customerName: actor.fullName,
          customerEmail: actor.email,
        }),
      ]);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/files");
    revalidatePath("/dashboard/notifications");

    return NextResponse.json(
      { ok: true, data: { id: project.id, projectCode: project.project_code } },
      { status: 201 }
    );
  } catch (error) {
    const normalized = normalizeActionError(error);
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json({ ok: false, error: normalized }, { status });
  }
}
