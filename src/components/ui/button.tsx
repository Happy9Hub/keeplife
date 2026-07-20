import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "ghost" | "outline" | "destructive";
type ButtonSize = "default" | "sm" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  icon: "h-9 w-9",
};

export function buttonStyles({
  className,
  variant = "default",
  size = "default",
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
    sizeStyles[size],
    variant === "ghost" &&
      "bg-transparent hover:bg-muted hover:text-foreground",
    variant === "outline" &&
      "border border-border bg-white text-foreground hover:bg-muted",
    variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "destructive" && "bg-destructive text-white hover:bg-destructive/90",
    className,
  );
}

export function Button({
  className,
  type = "button",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, size, variant })}
      type={type}
      {...props}
    />
  );
}
