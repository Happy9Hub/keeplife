"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { getMockBars, type ChartMode } from "@/features/dashboard/mock";
import { formatBaht, formatBahtCompact } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ExpenseChartDictionary = {
  title: string;
  month: string;
  year12: string;
  ytd: string;
  week: string;
};

type ExpenseChartProps = {
  locale: Locale;
  dict: ExpenseChartDictionary;
};

const MODES: ChartMode[] = ["month", "year12", "ytd"];

function buildLabels(mode: ChartMode, count: number, locale: Locale, week: string) {
  const intlLocale = locale === "th" ? "th-TH-u-ca-gregory" : "en-US";
  const monthFmt = new Intl.DateTimeFormat(intlLocale, { month: "short", timeZone: "UTC" });
  const now = new Date();

  if (mode === "month") {
    return Array.from({ length: count }, (_, i) => `${week}${i + 1}`);
  }
  if (mode === "ytd") {
    return Array.from({ length: count }, (_, i) =>
      monthFmt.format(new Date(Date.UTC(now.getUTCFullYear(), i, 1))),
    );
  }
  // year12: the last `count` months ending this month.
  return Array.from({ length: count }, (_, i) =>
    monthFmt.format(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1) + i, 1)),
    ),
  );
}

export function ExpenseChart({ locale, dict }: ExpenseChartProps) {
  const [mode, setMode] = useState<ChartMode>("month");

  const bars = getMockBars(mode);
  const max = Math.max(...bars, 1);
  const labels = buildLabels(mode, bars.length, locale, dict.week);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{dict.title}</h2>
          <div className="inline-flex rounded-full bg-muted p-0.5">
            {MODES.map((m) => (
              <button
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                key={m}
                onClick={() => setMode(m)}
                type="button"
              >
                {dict[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {/* y-axis (฿Nk) */}
          <div className="flex h-60 flex-col justify-between py-1 text-[0.65rem] text-muted-foreground">
            <span>{formatBahtCompact(max)}</span>
            <span>{formatBahtCompact(max / 2)}</span>
            <span>฿0</span>
          </div>

          {/* bars — the last bucket is the current period (full coral); past = light coral */}
          <div className="flex h-60 flex-1 items-end gap-2">
            {bars.map((value, i) => {
              const isCurrent = i === bars.length - 1;

              return (
                <div className="group flex h-full flex-1 flex-col justify-end" key={`${mode}-${i}`}>
                  <div className="relative mx-auto flex w-full max-w-12 flex-1 items-end">
                    <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[0.65rem] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                      {formatBaht(locale, value)}
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-[height] duration-300 ease-out group-hover:opacity-80",
                        isCurrent ? "bg-primary" : "bg-chart-1/50",
                      )}
                      style={{ height: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className="mt-2 truncate text-center text-[0.65rem] text-muted-foreground">
                    {labels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
