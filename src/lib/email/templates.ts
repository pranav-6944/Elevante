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

export interface ProjectSubmittedEmailPayload {
  projectCode: string;
  projectTitle: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
}

export function buildProjectSubmittedEmail(payload: ProjectSubmittedEmailPayload) {
  const safeCode = escapeHtml(payload.projectCode);
  const safeTitle = escapeHtml(payload.projectTitle);
  const safeService = escapeHtml(payload.serviceTitle);
  const safeName = escapeHtml(payload.customerName);

  return {
    subject: `[ELEVANTE] Project Request Received — ${payload.projectCode}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#17264F;">
        <div style="background:linear-gradient(100deg,#17264F 0%,#245B70 52%,#319C78 100%);padding:20px 24px;border-radius:12px 12px 0 0;color:#ffffff;">
          <h1 style="margin:0;font-size:18px;">Project Request Submitted</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">Reference Code: ${safeCode}</p>
        </div>
        <div style="border:1px solid #d8ddd6;border-top:none;padding:24px;border-radius:0 0 12px 12px;background:#ffffff;">
          <p>Hi ${safeName},</p>
          <p style="line-height:1.6;">We have received your project request <strong>${safeTitle}</strong> under <strong>${safeService}</strong>.</p>
          <p style="line-height:1.6;">Our team will review your brief and reference attachments, and update your portal status or issue a structured quotation.</p>
        </div>
      </div>
    `.trim(),
    text: [
      `ELEVANTE Project Request Received (${payload.projectCode})`,
      `Customer: ${payload.customerName} (${payload.customerEmail})`,
      `Service: ${payload.serviceTitle}`,
      `Project: ${payload.projectTitle}`,
    ].join("\n"),
  };
}

export function buildQuotationResponseEmail(payload: {
  projectCode: string;
  quoteNumber: string;
  projectTitle: string;
  decision: "accepted" | "revision_requested" | "declined";
  note?: string | null;
}) {
  const safeCode = escapeHtml(payload.projectCode);
  const safeQuote = escapeHtml(payload.quoteNumber);
  const safeTitle = escapeHtml(payload.projectTitle);
  const label =
    payload.decision === "accepted"
      ? "Accepted"
      : payload.decision === "revision_requested"
        ? "Revision Requested"
        : "Declined";
  const safeNote = payload.note ? escapeHtml(payload.note) : "None";

  return {
    subject: `[ELEVANTE] Quotation ${safeQuote} ${label} — ${safeCode}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#17264F;">
        <div style="background:linear-gradient(100deg,#17264F 0%,#245B70 52%,#319C78 100%);padding:20px 24px;border-radius:12px 12px 0 0;color:#ffffff;">
          <h1 style="margin:0;font-size:18px;">Quotation ${label}</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">${safeQuote} · ${safeCode}</p>
        </div>
        <div style="border:1px solid #d8ddd6;border-top:none;padding:24px;border-radius:0 0 12px 12px;background:#ffffff;">
          <p><strong>Project:</strong> ${safeTitle}</p>
          <p><strong>Customer Decision:</strong> ${label}</p>
          <p><strong>Note:</strong> ${safeNote}</p>
        </div>
      </div>
    `.trim(),
    text: `Quotation ${payload.quoteNumber} (${payload.projectCode}) ${label}\nProject: ${payload.projectTitle}\nNote: ${payload.note || "None"}`,
  };
}

export function buildProjectMessageEmail(payload: {
  projectCode: string;
  projectTitle: string;
  senderName: string;
  messageType: string;
  body: string;
}) {
  const safeCode = escapeHtml(payload.projectCode);
  const safeTitle = escapeHtml(payload.projectTitle);
  const safeSender = escapeHtml(payload.senderName);
  const safeBody = escapeHtml(payload.body).replaceAll("\n", "<br />");

  return {
    subject: `[ELEVANTE] New Project Update — ${payload.projectCode}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#17264F;">
        <div style="background:linear-gradient(100deg,#17264F 0%,#245B70 52%,#319C78 100%);padding:20px 24px;border-radius:12px 12px 0 0;color:#ffffff;">
          <h1 style="margin:0;font-size:18px;">New Project Message</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">${safeCode} — ${safeTitle}</p>
        </div>
        <div style="border:1px solid #d8ddd6;border-top:none;padding:24px;border-radius:0 0 12px 12px;background:#ffffff;">
          <p><strong>From:</strong> ${safeSender}</p>
          <p style="line-height:1.6;">${safeBody}</p>
        </div>
      </div>
    `.trim(),
    text: `Project ${payload.projectCode} (${payload.projectTitle})\nFrom: ${payload.senderName}\n\n${payload.body}`,
  };
}

export function buildDeliverableReleasedEmail(payload: {
  projectCode: string;
  projectTitle: string;
  deliverableTitle: string;
  versionLabel: string;
}) {
  const safeCode = escapeHtml(payload.projectCode);
  const safeTitle = escapeHtml(payload.projectTitle);
  const safeDel = escapeHtml(payload.deliverableTitle);
  const safeVer = escapeHtml(payload.versionLabel);

  return {
    subject: `[ELEVANTE] Deliverable Ready (${payload.versionLabel}) — ${payload.projectCode}`,
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#17264F;">
        <div style="background:linear-gradient(100deg,#17264F 0%,#245B70 52%,#319C78 100%);padding:20px 24px;border-radius:12px 12px 0 0;color:#ffffff;">
          <h1 style="margin:0;font-size:18px;">New Deliverable Released</h1>
          <p style="margin:4px 0 0;font-size:12px;opacity:0.9;">${safeCode} · ${safeTitle}</p>
        </div>
        <div style="border:1px solid #d8ddd6;border-top:none;padding:24px;border-radius:0 0 12px 12px;background:#ffffff;">
          <p><strong>${safeDel}</strong> (${safeVer}) is now available for download inside your ELEVANTE Client Portal.</p>
        </div>
      </div>
    `.trim(),
    text: `Deliverable Released: ${payload.deliverableTitle} (${payload.versionLabel}) for ${payload.projectCode}`,
  };
}
