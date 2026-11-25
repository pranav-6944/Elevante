export function sanitizeRedirectPath(
  nextParam: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!nextParam) {
    return fallback;
  }

  const trimmed = nextParam.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.startsWith("/api/auth/callback")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
