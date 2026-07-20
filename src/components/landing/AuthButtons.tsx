import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/components/UserMenu";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n";

type AuthButtonsProps = {
  dictionary: Dictionary;
  locale: Locale;
  isLoggedIn: boolean;
  userName: string;
};

export function AuthButtons({
  dictionary,
  locale,
  isLoggedIn,
  userName,
}: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <UserMenu
        dict={{
          dashboard: dictionary.dashboard.title,
          settings: dictionary.settings.title,
          signOut: dictionary.dashboard.signOut,
        }}
        locale={locale}
        userName={userName}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className={buttonStyles({ variant: "ghost" })} href={`/${locale}/signin`}>
        {dictionary.signIn}
      </Link>
      <Link className={buttonStyles({ variant: "default" })} href={`/${locale}/signup`}>
        {dictionary.signUp}
      </Link>
    </div>
  );
}
