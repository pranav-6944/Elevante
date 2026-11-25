import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeliverableReleasedEmail,
  buildEnquiryNotificationEmail,
  buildProjectMessageEmail,
  buildProjectSubmittedEmail,
  buildQuotationResponseEmail,
  escapeHtml,
} from "./templates.ts";

test("escapeHtml neutralizes HTML tags and quotes cleanly", () => {
  assert.equal(
    escapeHtml("<script>alert(\"xss\")</script> & 'test'"),
    "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;"
  );
});

test("buildEnquiryNotificationEmail escapes user fields in HTML output", () => {
  const email = buildEnquiryNotificationEmail({
    enquiryId: "enq-1",
    name: "<img src=x onerror=alert(1)>",
    email: "client@example.com",
    subject: "New website",
    message: "Line 1\nLine 2 <b>bold</b>",
  });

  assert.equal(email.subject, "[ELEVANTE Enquiry] New website");
  assert.ok(!email.html.includes("<img "));
  assert.ok(email.html.includes("&lt;img src=x onerror=alert(1)&gt;"));
  assert.ok(email.html.includes("Line 1<br />Line 2 &lt;b&gt;bold&lt;/b&gt;"));
});

test("buildProjectSubmittedEmail escapes customer and project fields safely", () => {
  const email = buildProjectSubmittedEmail({
    projectCode: "ELV-2026-0001",
    projectTitle: "<script>bad</script> Website",
    serviceTitle: "Web Development",
    customerName: "Pranav & Team",
    customerEmail: "pranav@example.com",
  });

  assert.equal(email.subject, "[ELEVANTE] Project Request Received — ELV-2026-0001");
  assert.ok(!email.html.includes("<script>bad</script>"));
  assert.ok(email.html.includes("&lt;script&gt;bad&lt;/script&gt; Website"));
  assert.ok(email.html.includes("Pranav &amp; Team"));
});

test("Phase 8 workflow email templates escape user-controlled fields safely", () => {
  const quoteEmail = buildQuotationResponseEmail({
    projectCode: "ELV-2026-0002",
    quoteNumber: "QT-2026-0001",
    projectTitle: "AI Platform",
    decision: "revision_requested",
    note: "<img onerror=1>",
  });
  assert.ok(!quoteEmail.html.includes("<img "));
  assert.ok(quoteEmail.html.includes("&lt;img onerror=1&gt;"));

  const msgEmail = buildProjectMessageEmail({
    projectCode: "ELV-2026-0002",
    projectTitle: "AI Platform",
    senderName: "Omkar <Co-Founder>",
    messageType: "clarification_request",
    body: "Line 1\n<script>x</script>",
  });
  assert.ok(!msgEmail.html.includes("<script>x</script>"));
  assert.ok(msgEmail.html.includes("Omkar &lt;Co-Founder&gt;"));

  const delEmail = buildDeliverableReleasedEmail({
    projectCode: "ELV-2026-0002",
    projectTitle: "AI Platform",
    deliverableTitle: "Build <v2>",
    versionLabel: "v2.0",
  });
  assert.ok(delEmail.html.includes("Build &lt;v2&gt;"));
});
