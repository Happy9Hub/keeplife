import { Card, CardContent } from "@/components/ui/card";

export type CategorySpendItem = {
  id: string;
  label: string;
  kind: string;
  amount: string;
  /** Share of the month's total spend, 0..100. */
  sharePct: number;
};

export type CategorySpendDictionary = {
  title: string;
  empty: string;
};

const KIND_ICON: Record<string, string> = {
  fixed: "🏠",
  variable: "🛒",
  leisure: "🎈",
};

export function CategorySpend({
  items,
  dict,
}: {
  items: CategorySpendItem[];
  dict: CategorySpendDictionary;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-foreground">{dict.title}</h2>

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{dict.empty}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.id}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base leading-none">
                    {KIND_ICON[item.kind] ?? "💸"}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{item.amount}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${item.sharePct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
