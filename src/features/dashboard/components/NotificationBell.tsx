"use client";

import { Bell } from "lucide-react";
import { useMemo, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MOCK_NOTIFICATIONS,
  type MockNotificationType,
} from "@/features/dashboard/mock";
import { formatBaht, relativeThai } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type NotificationBellDictionary = {
  notificationsLabel: string;
  title: string;
  empty: string;
  markAllRead: string;
  spendingWarning: string;
  moneyIn: string;
  subscriptionRenewal: string;
};

const TYPE_ICON: Record<MockNotificationType, string> = {
  spending_warning: "⚠️",
  money_in: "🎉",
  subscription_renewal: "🔁",
};

export function NotificationBell({
  locale,
  dict,
}: {
  locale: Locale;
  dict: NotificationBellDictionary;
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(MOCK_NOTIFICATIONS.filter((n) => n.read).map((n) => n.id)),
  );

  const now = useMemo(() => new Date(), []);
  const hasUnread = MOCK_NOTIFICATIONS.some((n) => !readIds.has(n.id));

  function messageFor(type: MockNotificationType, amount?: number) {
    const money = amount != null ? formatBaht(locale, amount) : "";
    if (type === "spending_warning") return dict.spendingWarning;
    if (type === "money_in") return dict.moneyIn.replace("{amount}", money);
    return dict.subscriptionRenewal.replace("{amount}", money);
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-label={dict.notificationsLabel}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          type="button"
        >
          <Bell className="h-5 w-5" />
          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white"
            />
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{dict.title}</span>
          {hasUnread ? (
            <button
              className="text-xs font-medium text-primary transition-colors hover:opacity-80"
              onClick={() =>
                setReadIds(new Set(MOCK_NOTIFICATIONS.map((n) => n.id)))
              }
              type="button"
            >
              {dict.markAllRead}
            </button>
          ) : null}
        </div>

        {MOCK_NOTIFICATIONS.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {dict.empty}
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => {
              const unread = !readIds.has(n.id);
              const when = relativeThai(
                locale,
                new Date(now.getTime() - n.minutesAgo * 60_000),
                now,
              );

              return (
                <li
                  className={cn(
                    "flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0",
                    unread && "bg-accent/40",
                  )}
                  key={n.id}
                >
                  <span className="text-lg leading-6">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {messageFor(n.type, n.amount)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{when}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
