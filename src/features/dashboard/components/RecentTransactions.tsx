import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export type RecentTransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  dateLabel: string;
};

export type RecentTransactionsDictionary = {
  title: string;
  empty: string;
  viewAll: string;
};

export function RecentTransactions({
  items,
  dict,
  href,
}: {
  items: RecentTransactionItem[];
  dict: RecentTransactionsDictionary;
  href: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <h2 className="text-sm font-semibold text-foreground">{dict.title}</h2>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{dict.empty}</p>
        ) : (
          <ul className="mt-3 flex-1 divide-y divide-border">
            {items.map((item) => (
              <li className="flex items-center gap-3 py-3" key={item.id}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.category}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">{item.amount}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.dateLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          className="mt-3 self-end text-xs font-medium text-primary transition-colors hover:opacity-80"
          href={href}
        >
          {dict.viewAll}
        </Link>
      </CardContent>
    </Card>
  );
}
