import assert from "node:assert/strict";
import test from "node:test";
import { extractClientIp } from "./ip.ts";

test("extractClientIp prioritizes x-forwarded-for first entry and falls back safely", () => {
  const forwarded = new Headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" });
  assert.equal(extractClientIp(forwarded), "203.0.113.10");

  const realIp = new Headers({ "x-real-ip": "198.51.100.22" });
  assert.equal(extractClientIp(realIp), "198.51.100.22");

  const empty = new Headers();
  assert.equal(extractClientIp(empty), "unknown");
});

