import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricCardsDictionary = {
  spentThisMonth: string;
  vsLastMonth: string;
  billsDue: string;
  billsCount: string;
  billsEmpty: string;
};

type MetricCardsProps = {
  dict: MetricCardsDictionary;
  spentAmount: string;
  deltaPct: number | null;
  billsCount: number;
};

export function MetricCards({ dict, spentAmount, deltaPct, billsCount }: MetricCardsProps) {
  const isUp = deltaPct !== null && deltaPct > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{dict.spentThisMonth}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {spentAmount}
          </p>
          {deltaPct !== null ? (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                isUp ? "text-destructive" : "text-secondary-foreground",
              )}
            >
              {isUp ? "▲" : "▼"} {Math.abs(deltaPct)}% {dict.vsLastMonth}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{dict.billsDue}</p>
          {billsCount === 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl leading-none">🌱</span>
              <p className="text-sm text-muted-foreground">{dict.billsEmpty}</p>
            </div>
          ) : (
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {dict.billsCount.replace("{n}", String(billsCount))}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
