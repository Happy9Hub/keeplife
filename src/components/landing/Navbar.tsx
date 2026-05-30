import { AuthButtons } from "@/components/landing/AuthButtons";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type NavbarProps = {
  dictionary: Dictionary["landing"];
  locale: Locale;
};

export function Navbar({ dictionary, locale }: NavbarProps) {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-black/5 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <h1 className="font-sans text-xl font-bold text-zinc-950">{dictionary.nav.logo}</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <AuthButtons dictionary={dictionary.auth} />
        </div>
      </div>
    </header>
  );
}
