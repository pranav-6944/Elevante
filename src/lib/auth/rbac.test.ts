import assert from "node:assert/strict";
import test from "node:test";
import {
  getDefaultHomeForRole,
  hasAllowedRole,
  isAdminPanelRole,
  isAdminRole,
  isSuperAdminRole,
} from "./rbac.ts";

test("RBAC role helpers enforce customer vs staff vs admin vs super_admin boundaries", () => {
  assert.equal(isAdminPanelRole("customer"), false);
  assert.equal(isAdminPanelRole("staff"), true);
  assert.equal(isAdminPanelRole("admin"), true);
  assert.equal(isAdminPanelRole("super_admin"), true);

  assert.equal(isAdminRole("staff"), false);
  assert.equal(isAdminRole("admin"), true);
  assert.equal(isSuperAdminRole("admin"), false);
  assert.equal(isSuperAdminRole("super_admin"), true);

  assert.equal(hasAllowedRole("customer", ["admin", "super_admin"]), false);
  assert.equal(hasAllowedRole("admin", ["admin", "super_admin"]), true);

  assert.equal(getDefaultHomeForRole("customer"), "/dashboard");
  assert.equal(getDefaultHomeForRole("staff"), "/admin");
  assert.equal(getDefaultHomeForRole("super_admin"), "/admin");
});

