import "server-only";
import { Resend } from "resend";
import { getServerEnv } from "@/config/env";
import { buildEnquiryNotificationEmail, type EnquiryEmailPayload } from "./templates";

let cachedResend: Resend | null = null;

function getResendClient(): Resend | null {
  const { RESEND_API_KEY } = getServerEnv();
  if (!RESEND_API_KEY) {
    return null;
  }
  if (!cachedResend) {
    cachedResend = new Resend(RESEND_API_KEY);
  }
  return cachedResend;
}

export interface EmailSendOutcome {
  sent: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<EmailSendOutcome> {
  const client = getResendClient();
  const { RESEND_FROM_EMAIL } = getServerEnv();

  if (!client || !RESEND_FROM_EMAIL) {
    return { sent: false, skipped: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("Resend email delivery failed:", error.message);
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (error) {
    console.error("Resend unexpected failure:", error);
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

export async function sendEnquiryNotificationEmail(
  payload: EnquiryEmailPayload
): Promise<EmailSendOutcome> {
  const { CONTACT_NOTIFICATION_EMAIL } = getServerEnv();
  if (!CONTACT_NOTIFICATION_EMAIL) {
    return { sent: false, skipped: true };
  }

  const content = buildEnquiryNotificationEmail(payload);
  return sendEmail({
    to: CONTACT_NOTIFICATION_EMAIL,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo: payload.email,
  });
}

