"use client";

import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/lib/i18n";

type UserMenuProps = {
  locale: Locale;
  userName: string;
  dict: {
    dashboard: string;
    settings: string;
    signOut: string;
  };
};

export function UserMenu({ locale, userName, dict }: UserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span className="max-w-32 truncate">{userName}</span>
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard`)}>
          {dict.dashboard}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
          {dict.settings}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          {dict.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
