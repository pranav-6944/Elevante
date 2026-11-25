export function extractClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first.slice(0, 64);
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp.slice(0, 64);
  }

  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) {
    return cfIp.slice(0, 64);
  }

  return "unknown";
}
