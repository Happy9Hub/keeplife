import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n";

type AuthButtonsProps = {
  dictionary: Dictionary;
  locale: Locale;
  isLoggedIn: boolean;
};

export function AuthButtons({ dictionary, locale, isLoggedIn }: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link className={buttonStyles({ variant: "ghost" })} href={`/${locale}/dashboard`}>
          {dictionary.dashboard.title}
        </Link>
        <SignOutButton dict={dictionary.dashboard.signOut} variant="outline" />
      </div>
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
