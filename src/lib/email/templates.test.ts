import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEnquiryNotificationEmail,
  buildProjectSubmittedEmail,
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
