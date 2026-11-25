import assert from "node:assert/strict";
import test from "node:test";
import {
  isFeaturedCapability,
  splitCapabilitiesIntoTracks,
  wrapLoopOffset,
} from "./capabilities-carousel.ts";

test("splitCapabilitiesIntoTracks balances two rows with featured tiles in distinct tracks", () => {
  const sample = [
    { id: "website-development" },
    { id: "3d-web-experiences" },
    { id: "application-development" },
    { id: "data-analytics" },
    { id: "excel-csv-automation" },
    { id: "ai-solutions" },
    { id: "logo-design" },
    { id: "branding" },
    { id: "document-presentation-design" },
  ];

  const { row1, row2 } = splitCapabilitiesIntoTracks(sample);
  assert.equal(row1.length + row2.length, sample.length);
  assert.ok(Math.abs(row1.length - row2.length) <= 1);
  assert.ok(row1.some((x) => x.id === "3d-web-experiences"));
  assert.ok(row2.some((x) => x.id === "ai-solutions"));
  assert.equal(isFeaturedCapability("3d-web-experiences"), true);
  assert.equal(isFeaturedCapability("ai-solutions"), true);
  assert.equal(isFeaturedCapability("website-development"), false);
});

test("wrapLoopOffset normalizes offsets cleanly within (-period, 0]", () => {
  assert.equal(wrapLoopOffset(0, 1000), 0);
  assert.equal(wrapLoopOffset(-1200, 1000), -200);
  assert.equal(wrapLoopOffset(150, 1000), -850);
  assert.equal(wrapLoopOffset(-500, 0), 0);
});
