export const locales = ["en", "th"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "en" ? "th" : "en";
}
