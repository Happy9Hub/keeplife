"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { defaultLocale, getOppositeLocale, isLocale, type Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale?: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentPathLocale = pathname.split("/")[1];
  const currentLocale = isLocale(currentPathLocale)
    ? currentPathLocale
    : (locale ?? defaultLocale);
  const nextLocale = getOppositeLocale(currentLocale);
  const label = nextLocale.toUpperCase();

  function switchLanguage() {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const nextPathname = segments.join("/") || `/${nextLocale}`;
    const queryString = window.location.search;

    router.push(`${nextPathname}${queryString}`);
  }

  return (
    <Button
      aria-label={`Switch language to ${nextLocale === "th" ? "Thai" : "English"}`}
      className="min-w-14 px-3"
      onClick={switchLanguage}
      variant="ghost"
    >
      {label}
    </Button>
  );
}
