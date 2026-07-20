"use client";

import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ColumnMenuItem = {
  label: string;
  href: string;
  active: boolean;
};

type ColumnHeaderMenuProps = {
  label: string;
  items: ColumnMenuItem[];
  // "asc"/"desc" = active sort direction; "filter" = a filter is applied.
  indicator?: "asc" | "desc" | "filter" | null;
  align?: "start" | "end";
};

const INDICATOR_GLYPH = {
  asc: "↑",
  desc: "↓",
  filter: "•",
} as const;

export function ColumnHeaderMenu({
  label,
  items,
  indicator = null,
  align = "start",
}: ColumnHeaderMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground",
            indicator ? "text-foreground" : "text-muted-foreground",
          )}
          type="button"
        >
          {label}
          <span aria-hidden="true" className="text-[0.7rem] leading-none">
            {indicator ? INDICATOR_GLYPH[indicator] : "▾"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-72 overflow-y-auto">
        {items.map((item) => (
          <DropdownMenuItem
            className="justify-between gap-6"
            key={`${item.label}-${item.href}`}
            onClick={() => router.replace(item.href, { scroll: false })}
          >
            {item.label}
            {item.active ? (
              <span aria-hidden="true" className="text-muted-foreground">
                ✓
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
