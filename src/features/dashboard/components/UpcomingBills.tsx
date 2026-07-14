import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UpcomingBill = {
  id: string;
  title: string;
  type: string;
  daysUntil: number;
  amount?: string;
  dueDateLabel: string;
};

export type UpcomingBillsDictionary = {
  title: string;
  empty: string;
  today: string;
  tomorrow: string;
  daysLeft: string;
};

const TYPE_ICON: Record<string, string> = {
  bill: "🧾",
  subscription: "🔁",
  maintenance: "🔧",
  passport: "🛂",
};

function urgencyClass(days: number) {
  if (days <= 3) return "bg-destructive/10 text-destructive";
  if (days <= 7) return "bg-warning-tint text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

export function UpcomingBills({
  items,
  dict,
}: {
  items: UpcomingBill[];
  dict: UpcomingBillsDictionary;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-foreground">{dict.title}</h2>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{dict.empty}</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {items.map((item) => {
              const urgency =
                item.daysUntil <= 0
                  ? dict.today
                  : item.daysUntil === 1
                    ? dict.tomorrow
                    : dict.daysLeft.replace("{n}", String(item.daysUntil));

              return (
                <li className="flex items-center gap-3 py-3" key={item.id}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
                    {TYPE_ICON[item.type] ?? "🔔"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.amount ? `${item.amount} · ` : ""}
                      {item.dueDateLabel}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      urgencyClass(item.daysUntil),
                    )}
                  >
                    {urgency}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
