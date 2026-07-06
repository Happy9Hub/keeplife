import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "secondary" | "blue" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeVariants: Record<BadgeVariant, string> = {
  secondary: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  outline: "border border-zinc-200 text-zinc-600",
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
