import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildOrganizationJsonLd,
  serializeJsonLd,
} from "./metadata.ts";

test("serializeJsonLd neutralizes script-closing angle brackets", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
  });
  assert.ok(!serialized.includes("<"));
  assert.ok(serialized.includes("\\u003c/script>"));
});

test("buildMetadata sets canonical URL, OpenGraph image, and optional noIndex", () => {
  const meta = buildMetadata({
    title: "Security",
    description: "Security details",
    path: "/dashboard",
    noIndex: true,
  });

  assert.equal(meta.alternates?.canonical, "/dashboard");
  assert.deepEqual(meta.robots, { index: false, follow: false });
  assert.ok(Array.isArray(meta.openGraph?.images));
});

test("buildBreadcrumbJsonLd and buildOrganizationJsonLd produce valid Schema.org graphs", () => {
  const crumbs = buildBreadcrumbJsonLd("https://elevante.example.com", [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);
  assert.equal(crumbs["@type"], "BreadcrumbList");
  assert.equal(crumbs.itemListElement.length, 2);
  assert.equal(crumbs.itemListElement[1].position, 2);
  assert.equal(crumbs.itemListElement[1].item, "https://elevante.example.com/services");

  const org = buildOrganizationJsonLd("https://elevante.example.com");
  assert.equal(org["@type"], "Organization");
  assert.equal(org.founders.length, 2);
});

