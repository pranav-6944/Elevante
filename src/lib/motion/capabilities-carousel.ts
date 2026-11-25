export const FEATURED_CAPABILITY_IDS = new Set<string>(["3d-web-experiences", "ai-solutions"]);

export function isFeaturedCapability(id: string): boolean {
  return FEATURED_CAPABILITY_IDS.has(id);
}

/**
 * Splits capability items across two balanced carousel tracks while preserving
 * key visual rhythm ("3D Web Experiences" in Row 1, "AI Solutions" in Row 2).
 */
export function splitCapabilitiesIntoTracks<T extends { id: string }>(
  items: readonly T[]
): { row1: T[]; row2: T[] } {
  const row1: T[] = [];
  const row2: T[] = [];

  for (const item of items) {
    if (item.id === "3d-web-experiences") {
      row1.push(item);
      continue;
    }
    if (item.id === "ai-solutions") {
      row2.push(item);
      continue;
    }

    if (row1.length <= row2.length) {
      row1.push(item);
    } else {
      row2.push(item);
    }
  }

  return { row1, row2 };
}

/**
 * Wraps an arbitrary horizontal offset cleanly inside (-period, 0] for seamless marquee looping.
 */
export function wrapLoopOffset(value: number, period: number): number {
  if (period <= 0) return 0;
  let wrapped = value % period;
  if (wrapped > 0) wrapped -= period;
  if (Object.is(wrapped, -0)) return 0;
  return wrapped;
}
