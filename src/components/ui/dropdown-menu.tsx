"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used inside DropdownMenu.");
  }

  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
}) {
  const { setOpen } = useDropdownMenu();
  const handleClick: React.MouseEventHandler = (event) => {
    children.props.onClick?.(event);
    setOpen((current) => !current);
  };

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return <button onClick={handleClick}>{children}</button>;
}

export function DropdownMenuContent({
  align = "start",
  children,
  className,
}: {
  align?: "start" | "end";
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useDropdownMenu();

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute top-11 z-50 min-w-40 rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { setOpen } = useDropdownMenu();

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-left text-sm outline-none hover:bg-zinc-100",
        className,
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      type="button"
    >
      {children}
    </button>
  );
}
