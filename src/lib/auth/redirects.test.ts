import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeRedirectPath } from "./redirects.ts";

test("sanitizeRedirectPath permits safe relative paths and blocks open redirects", () => {
  assert.equal(sanitizeRedirectPath("/dashboard/projects"), "/dashboard/projects");
  assert.equal(sanitizeRedirectPath("/reset-password?step=1"), "/reset-password?step=1");
  assert.equal(sanitizeRedirectPath(null), "/dashboard");
  assert.equal(sanitizeRedirectPath("https://evil.example/phish"), "/dashboard");
  assert.equal(sanitizeRedirectPath("//evil.example/phish"), "/dashboard");
  assert.equal(sanitizeRedirectPath("/\\evil.example"), "/dashboard");
  assert.equal(sanitizeRedirectPath("/api/auth/callback?code=123"), "/dashboard");
});
