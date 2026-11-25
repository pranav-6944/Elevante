export type VelocityAxis = "x" | "y" | "auto";

export interface VelocityStretchOptions {
  axis?: VelocityAxis;
  maxStretch?: number;
  deadzone?: number;
  velocityDivisor?: number;
  orthogonalSquash?: number;
}

export interface VelocityStretchResult {
  scaleX: number;
  scaleY: number;
}

/**
 * Computes snappy squash-and-stretch scale factors along the active travel axis
 * from real-time pixel velocities (px/s) while keeping settled scales at 1.0.
 */
export function computeVelocityStretch(
  vx: number,
  vy: number,
  options: VelocityStretchOptions = {}
): VelocityStretchResult {
  const {
    axis = "auto",
    maxStretch = 0.36,
    deadzone = 40,
    velocityDivisor = 2200,
    orthogonalSquash = 0.16,
  } = options;

  const vxEffective = axis === "y" ? 0 : Math.abs(vx);
  const vyEffective = axis === "x" ? 0 : Math.abs(vy);

  const sx =
    vxEffective > deadzone ? Math.min((vxEffective - deadzone) / velocityDivisor, maxStretch) : 0;
  const sy =
    vyEffective > deadzone ? Math.min((vyEffective - deadzone) / velocityDivisor, maxStretch) : 0;

  return {
    scaleX: Number((1 + sx - sy * orthogonalSquash).toFixed(4)),
    scaleY: Number((1 + sy - sx * orthogonalSquash).toFixed(4)),
  };
}

/**
 * Resolves the active navigation href using exact root matching and longest-prefix
 * matching for nested routes (e.g. /dashboard/projects/new vs /dashboard/projects).
 */
export function resolveActiveNavHref(
  pathname: string,
  hrefs: readonly string[],
  rootHref?: string
): string | null {
  const matches = hrefs.filter((href) => {
    if (rootHref && href === rootHref) {
      return pathname === rootHref;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  if (matches.length === 0) return null;

  matches.sort((a, b) => b.length - a.length);
  return matches[0] ?? null;
}
