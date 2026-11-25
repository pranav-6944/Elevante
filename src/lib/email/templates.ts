export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface EnquiryEmailPayload {
  enquiryId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  serviceInterest?: string | null;
  subject: string;
  message: string;
}

export function buildEnquiryNotificationEmail(payload: EnquiryEmailPayload) {
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = payload.phone ? escapeHtml(payload.phone) : "Not provided";
  const safeCompany = payload.company ? escapeHtml(payload.company) : "Not provided";
  const safeService = payload.serviceInterest ? escapeHtml(payload.serviceInterest) : "General";
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");

  return {
    subject: `[ELEVANTE Enquiry] ${payload.subject}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#17264F;">
        <div style="background:linear-gradient(100deg,#17264F 0%,#245B70 52%,#319C78 100%);padding:20px 24px;border-radius:12px 12px 0 0;color:#ffffff;">
          <h1 style="margin:0;font-size:18px;">New Website Enquiry</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">ID: ${escapeHtml(payload.enquiryId)}</p>
        </div>
        <div style="border:1px solid #d8ddd6;border-top:none;padding:24px;border-radius:0 0 12px 12px;background:#ffffff;">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Company:</strong> ${safeCompany}</p>
          <p><strong>Service Interest:</strong> ${safeService}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border:none;border-top:1px solid #eaece6;margin:16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="line-height:1.6;color:#24344d;">${safeMessage}</p>
        </div>
      </div>
    `.trim(),
    text: [
      `New Website Enquiry (${payload.enquiryId})`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "Not provided"}`,
      `Company: ${payload.company || "Not provided"}`,
      `Service Interest: ${payload.serviceInterest || "General"}`,
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ].join("\n"),
  };
}
