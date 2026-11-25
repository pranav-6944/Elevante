import assert from "node:assert/strict";
import test from "node:test";
import { contactEnquirySchema } from "./enquiry.ts";

test("contactEnquirySchema accepts valid enquiry payload and rejects invalid inputs", () => {
  const valid = contactEnquirySchema.safeParse({
    name: "Aarav Kulkarni",
    email: "aarav@example.com",
    phone: "+91 9876543210",
    company: "Kulkarni Foods",
    serviceInterest: "Website Development",
    subject: "New e-commerce storefront",
    message: "Looking to redesign our product catalog and order inquiry workflow.",
    website: "",
  });
  assert.equal(valid.success, true);

  const shortMsg = contactEnquirySchema.safeParse({
    name: "A",
    email: "bad-email",
    subject: "Hi",
    message: "Short",
  });
  assert.equal(shortMsg.success, false);

  const botTriggered = contactEnquirySchema.safeParse({
    name: "Bot User",
    email: "bot@example.com",
    subject: "Spam offer",
    message: "This message tries to bypass the hidden honeypot field.",
    website: "https://spam.invalid",
  });
  assert.equal(botTriggered.success, false);
});
