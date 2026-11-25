import "server-only";
import { isAdminSupabaseConfigured } from "@/config/env";
import { sendEnquiryNotificationEmail } from "@/lib/email/resend";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, normalizeDatabaseError } from "@/lib/utils/errors";
import { contactEnquirySchema } from "@/lib/validations/enquiry";

export async function submitPublicEnquiry({
  rawBody,
  clientIp,
}: {
  rawBody: unknown;
  clientIp: string;
}): Promise<{ enquiryId: string }> {
  const parsed = contactEnquirySchema.safeParse(rawBody);
  if (!parsed.success) {
    throw parsed.error;
  }

  if (!isAdminSupabaseConfigured()) {
    throw new AppError(
      "CONFIGURATION_ERROR",
      "Your enquiry was validated successfully, but database configuration (Supabase service key) is not active in this environment yet. Please email us directly.",
      503
    );
  }

  await enforceRateLimit({
    key: `contact_enquiry:${clientIp}`,
    maxRequests: 5,
    windowSeconds: 900,
  });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enquiries")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      service_interest: parsed.data.serviceInterest || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    throw normalizeDatabaseError(error, "Unable to save your enquiry right now.");
  }

  // Non-blocking notification email: DB record is already persisted.
  await sendEnquiryNotificationEmail({
    enquiryId: data.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company,
    serviceInterest: parsed.data.serviceInterest,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  return { enquiryId: data.id };
}

