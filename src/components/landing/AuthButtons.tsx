import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n";

type AuthButtonsProps = {
  dictionary: Dictionary;
  locale: Locale;
};

export function AuthButtons({ dictionary, locale }: AuthButtonsProps) {
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
