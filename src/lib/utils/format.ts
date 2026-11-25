export function formatMoneyMinor(minor: number | null, currency = "INR"): string | null {
  if (minor === null || !Number.isFinite(minor)) return null;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${currency} ${(minor / 100).toFixed(0)}`;
  }
}
