import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "secondary" | "blue" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeVariants: Record<BadgeVariant, string> = {
  secondary: "bg-muted text-foreground",
  blue: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-muted-foreground",
};

export function Badge({
  className,
  variant = "secondary",
  ...props
}: BadgeProps) {
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
