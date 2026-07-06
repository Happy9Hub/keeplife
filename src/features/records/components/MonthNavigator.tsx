"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type MonthNavigatorProps = {
  basePath: string;
  // Current filter/sort params to keep when the month changes (no `month` key).
  preservedParams: Record<string, string>;
  selectedYear: number;
  selectedMonthIndex: number;
  label: string;
  monthNames: string[];
  prevYearLabel: string;
  nextYearLabel: string;
};

export function MonthNavigator({
  basePath,
  preservedParams,
  selectedYear,
  selectedMonthIndex,
  label,
  monthNames,
  prevYearLabel,
  nextYearLabel,
}: MonthNavigatorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);

  function handleOpenChange(next: boolean) {
    if (next) {
      // Always reopen on the currently selected year.
      setViewYear(selectedYear);
    }
    setOpen(next);
  }

  function selectMonth(monthIndex: number) {
    const params = new URLSearchParams(preservedParams);
    params.set("month", `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`);
    setOpen(false);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          type="button"
        >
          {label}
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64">
        <div className="flex items-center justify-between">
          <Button
            aria-label={prevYearLabel}
            onClick={() => setViewYear((year) => year - 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-zinc-900">{viewYear}</span>
          <Button
            aria-label={nextYearLabel}
            onClick={() => setViewYear((year) => year + 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {monthNames.map((name, index) => {
            const isSelected = viewYear === selectedYear && index === selectedMonthIndex;

            return (
              <Button
                className={cn("w-full", !isSelected && "text-zinc-600")}
                key={name}
                onClick={() => selectMonth(index)}
                size="sm"
                variant={isSelected ? "default" : "ghost"}
              >
                {name}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
