import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateQuotationTotals,
  canActorManageRoleChange,
  canActorToggleProfileStatus,
  portfolioUpsertSchema,
  quotationUpsertSchema,
} from "./admin.ts";

test("calculateQuotationTotals computes server-side line totals and rejects excessive discounts", () => {
  const valid = calculateQuotationTotals(
    [
      {
        title: "Architecture & UI",
        description: "",
        quantity: 2,
        unitPriceMinor: 250000,
        displayOrder: 0,
      },
      {
        title: "Backend APIs",
        description: "",
        quantity: 1,
        unitPriceMinor: 300000,
        displayOrder: 1,
      },
    ],
    50000,
    90000
  );

  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.subtotalMinor, 800000);
    assert.equal(valid.totalMinor, 840000);
    assert.equal(valid.computedItems[0].lineTotalMinor, 500000);
  }

  const badDiscount = calculateQuotationTotals(
    [{ title: "Sprint", description: "", quantity: 1, unitPriceMinor: 100000, displayOrder: 0 }],
    150000,
    0
  );
  assert.equal(badDiscount.ok, false);

  const parsedQuote = quotationUpsertSchema.safeParse({
    projectId: "11111111-1111-4111-8111-111111111111",
    title: "MVP Engineering Proposal",
    scopeSummary: "Full Next.js + Supabase implementation across customer and admin modules.",
    currency: "inr",
    items: [{ title: "Core Build", quantity: 1, unitPriceMinor: 500000 }],
  });
  assert.equal(parsedQuote.success, true);
  if (parsedQuote.success) {
    assert.equal(parsedQuote.data.currency, "INR");
  }
});

test("RBAC role and activation guards prevent privilege escalation and self-lockout", () => {
  assert.equal(
    canActorManageRoleChange({
      actorId: "admin-1",
      actorRole: "admin",
      targetUserId: "user-2",
    }).ok,
    false
  );

  assert.equal(
    canActorManageRoleChange({
      actorId: "super-1",
      actorRole: "super_admin",
      targetUserId: "super-1",
    }).ok,
    false
  );

  assert.equal(
    canActorManageRoleChange({
      actorId: "super-1",
      actorRole: "super_admin",
      targetUserId: "user-2",
    }).ok,
    true
  );

  assert.equal(
    canActorToggleProfileStatus({
      actorId: "admin-1",
      actorRole: "admin",
      targetUserId: "super-1",
      targetCurrentRole: "super_admin",
    }).ok,
    false
  );
});

test("portfolioUpsertSchema validates slugs and blocks unsafe liveUrl protocols", () => {
  const badUrl = portfolioUpsertSchema.safeParse({
    title: "Enterprise Analytics Portal",
    slug: "enterprise-analytics",
    summary: "Real-time telemetry platform built on Next.js and Supabase.",
    liveUrl: "javascript:alert(1)",
  });
  assert.equal(badUrl.success, false);

  const good = portfolioUpsertSchema.safeParse({
    title: "Enterprise Analytics Portal",
    slug: "enterprise-analytics",
    summary: "Real-time telemetry platform built on Next.js and Supabase.",
    liveUrl: "https://elevante.example.com",
    techStack: ["Next.js", "PostgreSQL"],
    outcomes: ["40% faster reporting"],
    isPublished: true,
  });
  assert.equal(good.success, true);
});
