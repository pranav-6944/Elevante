import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { AppError, fail, normalizeActionError, ok } from "./errors.ts";

test("ok and fail build discriminated ActionResult envelopes", () => {
  const success = ok({ id: "123" });
  assert.deepEqual(success, { ok: true, data: { id: "123" } });

  const failure = fail("NOT_FOUND", "Project not found");
  assert.deepEqual(failure, {
    ok: false,
    error: { code: "NOT_FOUND", message: "Project not found" },
  });
});

test("normalizeActionError maps AppError and ZodError cleanly without leaking internals", () => {
  const appErr = new AppError("FORBIDDEN", "Access denied", 403);
  assert.deepEqual(normalizeActionError(appErr), {
    code: "FORBIDDEN",
    message: "Access denied",
  });

  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse({ email: "invalid" });
  assert.equal(parsed.success, false);
  const zodMapped = normalizeActionError(parsed.error);
  assert.equal(zodMapped.code, "VALIDATION_ERROR");
  assert.ok(Array.isArray(zodMapped.fieldErrors?.email));

  const unknownMapped = normalizeActionError(new Error("raw postgres connection string leak"));
  assert.deepEqual(unknownMapped, {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
  });
});
