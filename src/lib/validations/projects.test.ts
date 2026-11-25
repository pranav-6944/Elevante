import assert from "node:assert/strict";
import test from "node:test";
import { validateDynamicBriefSubmission, type DynamicFieldSpec } from "./dynamic-form.ts";
import {
  buildProjectAttachmentPath,
  canUserAccessProject,
  canUserDownloadFile,
  createProjectRequestSchema,
  isValidStoragePrefixForProject,
  MAX_ATTACHMENT_BYTES,
  sanitizeAttachmentFilename,
  validateAttachmentMeta,
} from "./projects.ts";

test("createProjectRequestSchema validates project request inputs and rejects short/invalid entries", () => {
  const valid = createProjectRequestSchema.safeParse({
    serviceId: "11111111-1111-4111-8111-111111111111",
    title: "B2B SaaS Marketing Platform",
    summary: "We need a full Next.js marketing site with a customer portal and CMS.",
    priority: "high",
    desiredDeadline: "2026-12-31",
    budgetRange: "INR 1L - 2.5L",
    dynamicResponses: { platform: "web" },
  });
  assert.equal(valid.success, true);

  const invalid = createProjectRequestSchema.safeParse({
    serviceId: "not-a-uuid",
    title: "Hi",
    summary: "Too short",
    desiredDeadline: "31/12/2026",
  });
  assert.equal(invalid.success, false);
});

test("validateAttachmentMeta enforces MIME allowlist, extension match, byte limits, and traversal stripping", () => {
  assert.equal(sanitizeAttachmentFilename("../../etc/Brand Spec (v1).PDF"), "brand-spec-v1.pdf");

  const validPdf = validateAttachmentMeta({
    name: "../../Architecture Spec.pdf",
    type: "application/pdf",
    size: 1024 * 500,
  });
  assert.equal(validPdf.ok, true);
  if (validPdf.ok) {
    assert.equal(validPdf.safeName, "architecture-spec.pdf");
    const path = buildProjectAttachmentPath("proj-1", "user-1", validPdf.safeName, "uuid-123");
    assert.equal(path, "proj-1/user-1/uuid-123-architecture-spec.pdf");
    assert.equal(isValidStoragePrefixForProject(path, "proj-1"), true);
    assert.equal(isValidStoragePrefixForProject("proj-1/../proj-2/secret.pdf", "proj-1"), false);
  }

  const disallowedSvg = validateAttachmentMeta({
    name: "xss.svg",
    type: "image/svg+xml",
    size: 512,
  });
  assert.equal(disallowedSvg.ok, false);

  const mismatchedExt = validateAttachmentMeta({
    name: "payload.exe",
    type: "application/pdf",
    size: 512,
  });
  assert.equal(mismatchedExt.ok, false);

  const oversized = validateAttachmentMeta({
    name: "huge.zip",
    type: "application/zip",
    size: MAX_ATTACHMENT_BYTES + 1,
  });
  assert.equal(oversized.ok, false);
});

test("tenant isolation guards prevent Customer A from accessing Customer B projects or deliverables", () => {
  assert.equal(
    canUserAccessProject({
      actorId: "cust-a",
      actorRole: "customer",
      customerId: "cust-a",
    }),
    true
  );

  assert.equal(
    canUserAccessProject({
      actorId: "cust-a",
      actorRole: "customer",
      customerId: "cust-b",
    }),
    false
  );

  assert.equal(
    canUserDownloadFile({
      actorId: "cust-a",
      actorRole: "customer",
      customerId: "cust-b",
      kind: "reference",
    }),
    false
  );

  assert.equal(
    canUserDownloadFile({
      actorId: "cust-a",
      actorRole: "customer",
      customerId: "cust-a",
      kind: "deliverable",
      isCustomerAccessible: false,
    }),
    false
  );

  assert.equal(
    canUserDownloadFile({
      actorId: "admin-1",
      actorRole: "admin",
      customerId: "cust-b",
      kind: "deliverable",
      isCustomerAccessible: false,
    }),
    true
  );
});

test("submitted dynamic brief snapshot preserves field label/key even if template later changes", () => {
  const fieldsAtSubmitTime: DynamicFieldSpec[] = [
    {
      id: "field-1",
      fieldKey: "target_launch",
      label: "Target Launch Quarter",
      fieldType: "text",
      placeholder: null,
      helpText: null,
      options: [],
      validationRules: {},
      isRequired: true,
      displayOrder: 1,
      isActive: true,
    },
  ];

  const submitted = validateDynamicBriefSubmission(fieldsAtSubmitTime, {
    target_launch: "Q1 2027",
  });
  assert.equal(submitted.ok, true);
  if (submitted.ok) {
    // Mutating the live field template afterward does not alter captured snapshot values
    fieldsAtSubmitTime[0].label = "Renamed Quarter Label";
    assert.equal(submitted.responses[0].fieldLabel, "Target Launch Quarter");
    assert.equal(submitted.schemaSnapshot[0].label, "Target Launch Quarter");
  }
});
