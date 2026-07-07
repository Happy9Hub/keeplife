import Link from "next/link";

import { AppNav } from "@/components/AppNav";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { UserMenu } from "@/features/auth/components/UserMenu";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n";

type AppHeaderProps = {
  lang: Locale;
  dictionary: Dictionary;
  userName: string;
  householdName?: string | null;
};

/**
 * Shared chrome for authenticated pages (dashboard, settings, ...):
 * home-linked brand + active household name, language switcher, and account menu.
 */
export function AppHeader({ lang, dictionary, userName, householdName }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex flex-col">
        <Link
          className="text-sm font-semibold tracking-tight text-foreground transition hover:opacity-80"
          href={`/${lang}`}
        >
          {dictionary.landing.nav.logo}
        </Link>
        {householdName ? (
          <span className="text-xs text-muted-foreground">
            {dictionary.dashboard.householdLabel}: {householdName}
          </span>
        ) : null}
      </div>

      <AppNav
        items={[
          { href: `/${lang}/dashboard`, label: dictionary.dashboard.title },
          { href: `/${lang}/records`, label: dictionary.records.navLabel },
          { href: `/${lang}/reminders`, label: dictionary.reminders.navLabel },
        ]}
      />

      <div className="flex items-center gap-3">
        <LanguageSwitcher locale={lang} />
        <UserMenu
          dict={{
            dashboard: dictionary.dashboard.title,
            settings: dictionary.settings.title,
            signOut: dictionary.dashboard.signOut,
          }}
          locale={lang}
          userName={userName}
        />
      </div>
    </header>
  );
}
