import assert from "node:assert/strict";
import test from "node:test";
import { buildEnquiryNotificationEmail, escapeHtml } from "./templates.ts";

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
