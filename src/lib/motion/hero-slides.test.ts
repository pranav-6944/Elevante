import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getNextHeroSlideIndex, HERO_SLIDES } from "./hero-slides.ts";

test("HERO_SLIDES preserves 1 -> 2 -> 3 loop order and asset files exist", () => {
  assert.deepEqual(
    HERO_SLIDES.map((s) => s.src),
    ["/images/hero-studio-1.webp", "/images/hero-studio-2.webp", "/images/hero-studio-3.webp"]
  );

  for (const slide of HERO_SLIDES) {
    const absPath = path.join(process.cwd(), "public", slide.src.replace(/^\//, ""));
    assert.equal(fs.existsSync(absPath), true, `Missing hero image asset: ${slide.src}`);
  }

  assert.equal(getNextHeroSlideIndex(0, 3), 1);
  assert.equal(getNextHeroSlideIndex(1, 3), 2);
  assert.equal(getNextHeroSlideIndex(2, 3), 0);
});
