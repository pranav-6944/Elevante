import assert from "node:assert/strict";
import test from "node:test";
import { computeScrambleFrame } from "./scramble-text.ts";

test("computeScrambleFrame preserves whitespace, locks left-to-right, and settles cleanly", () => {
  assert.equal(computeScrambleFrame("", 0.5), "");
  assert.equal(computeScrambleFrame("ELEVANTE Live", 1), "ELEVANTE Live");
  assert.equal(computeScrambleFrame("ELEVANTE Live", 1.2), "ELEVANTE Live");

  const startFrame = computeScrambleFrame("AB CD", 0, {
    charset: "XYZ",
    random: () => 0.1,
  });
  assert.equal(startFrame, "XX XX");

  const midFrame = computeScrambleFrame("ABCDEF", 0.5, {
    charset: "9",
    random: () => 0,
  });
  assert.equal(midFrame, "ABC999");

  const customCharset = computeScrambleFrame("Test!", -0.4, {
    charset: "#",
    random: () => 0.9,
  });
  assert.equal(customCharset, "#####");
});

