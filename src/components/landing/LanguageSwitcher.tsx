"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getOppositeLocale, type Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = getOppositeLocale(locale);
  const label = nextLocale.toUpperCase();

  function switchLanguage() {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
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
