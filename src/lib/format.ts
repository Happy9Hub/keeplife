import type { Locale } from "@/lib/i18n";

function intlLocale(locale: Locale) {
  return locale === "th" ? "th-TH-u-ca-gregory" : "en-US";
}

/** ฿ with thousands separators, 2 decimals — the app-wide currency format. */
export function formatBaht(locale: Locale, amount: number) {
  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    style: "currency",
    currency: "THB",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact axis label like ฿12k / ฿1.2M. */
export function formatBahtCompact(amount: number) {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return `฿${compact}`;
}

/** Full human date, e.g. "7 Jul 2026" / Thai equivalent (Gregorian year). */
export function formatThaiDate(locale: Locale, date: Date) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Relative time in casual Thai / English, from `date` to now.
 * e.g. "2 ชม.ที่แล้ว" / "2h ago". Mock-feed friendly.
 */
export function relativeThai(locale: Locale, date: Date, now: Date = new Date()) {
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3_600_000);
  const days = Math.round(diffMs / 86_400_000);
  const th = locale === "th";

  if (minutes < 1) return th ? "เมื่อกี้" : "just now";
  if (minutes < 60) return th ? `${minutes} นาทีที่แล้ว` : `${minutes}m ago`;
  if (hours < 24) return th ? `${hours} ชม.ที่แล้ว` : `${hours}h ago`;
  return th ? `${days} วันที่แล้ว` : `${days}d ago`;
}
