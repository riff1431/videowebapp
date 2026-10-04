import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 border-b border-[var(--border)] w-full overflow-x-auto pb-1 scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  active,
  onClick,
  children,
  className,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap",
        active
          ? "border-[var(--default-brand-red)] text-[var(--default-text)] font-semibold"
          : "border-transparent text-[var(--default-muted)] hover:text-[var(--default-text)]",
        className
      )}
    >
      {children}
    </button>
  );
}
