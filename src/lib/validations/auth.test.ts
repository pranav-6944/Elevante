import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, registerSchema, resetPasswordSchema } from "./auth.ts";

test("auth schemas enforce password complexity and confirmation matching", () => {
  const validReg = registerSchema.safeParse({
    fullName: "Riya Sharma",
    email: "riya@example.com",
    companyName: "Studio Riya",
    password: "Password123",
    confirmPassword: "Password123",
  });
  assert.equal(validReg.success, true);

  const weakPass = registerSchema.safeParse({
    fullName: "Riya Sharma",
    email: "riya@example.com",
    password: "passwordonly",
    confirmPassword: "passwordonly",
  });
  assert.equal(weakPass.success, false);

  const mismatch = resetPasswordSchema.safeParse({
    password: "Password123",
    confirmPassword: "Password456",
  });
  assert.equal(mismatch.success, false);

  const validLogin = loginSchema.safeParse({
    email: "riya@example.com",
    password: "any-existing-password",
  });
  assert.equal(validLogin.success, true);
});

