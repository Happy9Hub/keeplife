import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
};

export function buttonStyles({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
} = {}) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50",
    variant === "ghost" && "bg-transparent hover:bg-zinc-100 hover:text-zinc-900",
    variant === "outline" &&
      "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50",
    variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-800",
    className,
  );
}

export function Button({
  className,
  type = "button",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, variant })}
      type={type}
      {...props}
    />
  );
}
