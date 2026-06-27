"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { defaultLocale, isLocale } from "@/lib/i18n";

type SignOutButtonProps = {
  dict: string | {
    signOut: string;
  };
  variant?: "ghost" | "outline";
};

export function SignOutButton({
  dict,
  variant = "ghost",
}: SignOutButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const locale = getLocaleFromPathname(pathname);
  const label = typeof dict === "string" ? dict : dict.signOut;

  async function handleSignOut() {
    setIsSigningOut(true);

    await authClient.signOut();
    router.push(`/${locale}/signin`);
    router.refresh();
  }

  return (
    <Button disabled={isSigningOut} onClick={handleSignOut} variant={variant}>
      {label}
    </Button>
  );
}

function getLocaleFromPathname(pathname: string) {
  const maybeLocale = pathname.split("/")[1];

  return isLocale(maybeLocale) ? maybeLocale : defaultLocale;
}
