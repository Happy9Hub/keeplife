import Link from "next/link";

import { cn } from "@/lib/utils";

type SortHeaderProps = {
  label: string;
  href: string;
  // Active sort direction for this column, or null when it isn't the sort column.
  indicator: "asc" | "desc" | null;
};

export function SortHeader({ label, href, indicator }: SortHeaderProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground",
        indicator ? "text-foreground" : "text-muted-foreground",
      )}
      href={href}
      scroll={false}
    >
      {label}
      <span aria-hidden="true" className="text-[0.7rem] leading-none">
        {indicator === "asc" ? "↑" : indicator === "desc" ? "↓" : "↕"}
      </span>
    </Link>
  );
}
