export const DEFAULT_SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*";

export interface ScrambleFrameOptions {
  charset?: string;
  preserveSpaces?: boolean;
  random?: () => number;
}

/**
 * Produces a progressive reveal frame for `target` at normalized `progress` in [0, 1],
 * locking characters left-to-right while scrambling unrevealed non-whitespace glyphs.
 */
export function computeScrambleFrame(
  target: string,
  progress: number,
  options: ScrambleFrameOptions = {}
): string {
  if (!target || progress >= 1) return target;

  const { charset = DEFAULT_SCRAMBLE_CHARS, preserveSpaces = true, random = Math.random } = options;
  const safeCharset = charset.length > 0 ? charset : DEFAULT_SCRAMBLE_CHARS;
  const clamped = Math.max(0, Math.min(1, progress));
  const revealedCount = Math.floor(clamped * target.length);

  let result = "";
  for (let i = 0; i < target.length; i += 1) {
    const ch = target[i]!;
    if (i < revealedCount || (preserveSpaces && /\s/.test(ch))) {
      result += ch;
    } else {
      const idx = Math.min(safeCharset.length - 1, Math.floor(random() * safeCharset.length));
      result += safeCharset[idx]!;
    }
  }

  return result;
}
