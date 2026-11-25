import assert from "node:assert/strict";
import test from "node:test";
import { computeVelocityStretch, resolveActiveNavHref } from "./velocity-highlight.ts";

test("computeVelocityStretch stays at 1.0 within deadzone and stretches along travel axis", () => {
  assert.deepEqual(computeVelocityStretch(0, 0), { scaleX: 1, scaleY: 1 });
  assert.deepEqual(computeVelocityStretch(25, -30), { scaleX: 1, scaleY: 1 });

  const horizontal = computeVelocityStretch(1540, 0, { axis: "auto", maxStretch: 0.36 });
  assert.ok(horizontal.scaleX > 1.2 && horizontal.scaleX <= 1.36);
  assert.ok(horizontal.scaleY < 1 && horizontal.scaleY >= 0.94);

  const capped = computeVelocityStretch(99999, 0, { axis: "x", maxStretch: 0.36 });
  assert.deepEqual(capped, { scaleX: 1.36, scaleY: 0.9424 });

  const verticalOnly = computeVelocityStretch(2000, 1200, { axis: "y", maxStretch: 0.36 });
  assert.ok(verticalOnly.scaleY > 1.15);
  assert.ok(verticalOnly.scaleX < 1);
});

test("resolveActiveNavHref selects exact root matches and longest nested prefix", () => {
  const portalHrefs = [
    "/dashboard",
    "/dashboard/projects/new",
    "/dashboard/projects",
    "/dashboard/files",
  ];

  assert.equal(resolveActiveNavHref("/dashboard", portalHrefs, "/dashboard"), "/dashboard");
  assert.equal(
    resolveActiveNavHref("/dashboard/projects/new", portalHrefs, "/dashboard"),
    "/dashboard/projects/new"
  );
  assert.equal(
    resolveActiveNavHref("/dashboard/projects/abc-123", portalHrefs, "/dashboard"),
    "/dashboard/projects"
  );
  assert.equal(resolveActiveNavHref("/about", portalHrefs, "/dashboard"), null);
});
