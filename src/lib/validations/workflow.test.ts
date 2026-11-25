import assert from "node:assert/strict";
import test from "node:test";
import { validateDynamicBriefSubmission } from "./dynamic-form.ts";
import { calculateQuotationTotals } from "./admin.ts";
import { canUserAccessProject, canUserDownloadFile, validateAttachmentMeta } from "./projects.ts";
import {
  buildDeliverableStoragePath,
  canCustomerRespondToQuotation,
  customerQuotationResponseSchema,
  getNextProjectStatusAfterMessage,
  MAX_DELIVERABLE_BYTES,
  validateDeliverableFileMeta,
  validateMessageAuthorization,
} from "./workflow.ts";

test("14-step project lifecycle enforces state, permission, internal-note, and deliverable boundaries", () => {
  // Steps 1-5: service intake snapshot + attachment validation
  const brief = validateDynamicBriefSubmission(
    [
      {
        id: "f-1",
        fieldKey: "target_platform",
        label: "Target Platform",
        fieldType: "select",
        placeholder: null,
        helpText: null,
        options: [{ label: "Web App", value: "web" }],
        validationRules: {},
        isRequired: true,
        displayOrder: 1,
        isActive: true,
      },
    ],
    { target_platform: "web" }
  );
  assert.equal(brief.ok, true);
  assert.equal(
    validateAttachmentMeta({ name: "wireframe.pdf", type: "application/pdf", size: 2048 }).ok,
    true
  );

  // Step 7: Admin clarification request moves submitted -> clarification_needed; customer reply restores under_review
  const adminClarify = validateMessageAuthorization({
    actorId: "admin-1",
    actorRole: "admin",
    customerId: "cust-1",
    projectStatus: "under_review",
    messageType: "clarification_request",
    isInternalNote: false,
  });
  assert.equal(adminClarify.ok, true);
  assert.equal(
    getNextProjectStatusAfterMessage({
      currentStatus: "under_review",
      messageType: "clarification_request",
      isInternalNote: false,
      actorRole: "admin",
    }),
    "clarification_needed"
  );

  const custReply = validateMessageAuthorization({
    actorId: "cust-1",
    actorRole: "customer",
    customerId: "cust-1",
    projectStatus: "clarification_needed",
    messageType: "clarification_response",
    isInternalNote: false,
  });
  assert.equal(custReply.ok, true);
  assert.equal(
    getNextProjectStatusAfterMessage({
      currentStatus: "clarification_needed",
      messageType: "clarification_response",
      isInternalNote: false,
      actorRole: "customer",
    }),
    "under_review"
  );

  // Customer cannot inject internal notes or impersonate admin clarification requests
  assert.equal(
    validateMessageAuthorization({
      actorId: "cust-1",
      actorRole: "customer",
      customerId: "cust-1",
      projectStatus: "under_review",
      messageType: "message",
      isInternalNote: true,
    }).ok,
    false
  );
  assert.equal(
    validateMessageAuthorization({
      actorId: "cust-1",
      actorRole: "customer",
      customerId: "cust-1",
      projectStatus: "under_review",
      messageType: "clarification_request",
      isInternalNote: false,
    }).ok,
    false
  );

  // Admin internal notes must not shift customer-visible project status
  assert.equal(
    getNextProjectStatusAfterMessage({
      currentStatus: "under_review",
      messageType: "clarification_request",
      isInternalNote: true,
      actorRole: "admin",
    }),
    null
  );

  // Steps 8-9: Quotation totals + customer accept/revision checks
  const quoteTotals = calculateQuotationTotals(
    [
      {
        title: "Full Build",
        description: "",
        quantity: 1,
        unitPriceMinor: 500000,
        displayOrder: 0,
      },
    ],
    0,
    90000
  );
  assert.equal(quoteTotals.ok, true);
  assert.equal(canCustomerRespondToQuotation("draft").ok, false);
  assert.equal(canCustomerRespondToQuotation("accepted").ok, false);
  assert.equal(canCustomerRespondToQuotation("sent").ok, true);

  assert.equal(
    customerQuotationResponseSchema.safeParse({
      quotationId: "11111111-1111-4111-8111-111111111111",
      decision: "revision_requested",
      note: "No",
    }).success,
    false
  );
  assert.equal(
    customerQuotationResponseSchema.safeParse({
      quotationId: "11111111-1111-4111-8111-111111111111",
      decision: "accepted",
      note: "Approved to proceed.",
    }).success,
    true
  );

  // Steps 12-14: Deliverable validation & visibility gating
  const validZip = validateDeliverableFileMeta({
    name: "Release Bundle v1.zip",
    type: "application/zip",
    size: 1024 * 1024,
  });
  assert.equal(validZip.ok, true);
  if (validZip.ok) {
    assert.equal(
      buildDeliverableStoragePath("proj-1", validZip.safeName, "uuid-1"),
      "proj-1/uuid-1-release-bundle-v1.zip"
    );
  }

  assert.equal(
    validateDeliverableFileMeta({
      name: "readme.txt",
      type: "text/plain",
      size: 100,
    }).ok,
    false
  );
  assert.equal(
    validateDeliverableFileMeta({
      name: "oversize.zip",
      type: "application/zip",
      size: MAX_DELIVERABLE_BYTES + 1,
    }).ok,
    false
  );

  // Hidden deliverable cannot be downloaded by customer until admin enables isCustomerAccessible
  assert.equal(
    canUserDownloadFile({
      actorId: "cust-1",
      actorRole: "customer",
      customerId: "cust-1",
      kind: "deliverable",
      isCustomerAccessible: false,
    }),
    false
  );
  assert.equal(
    canUserDownloadFile({
      actorId: "cust-1",
      actorRole: "customer",
      customerId: "cust-1",
      kind: "deliverable",
      isCustomerAccessible: true,
    }),
    true
  );
  assert.equal(
    canUserAccessProject({
      actorId: "cust-2",
      actorRole: "customer",
      customerId: "cust-1",
    }),
    false
  );
});
