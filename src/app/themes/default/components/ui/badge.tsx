import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "duration" | "new" | "live" | "verified" | "pro";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full text-[10px] font-semibold leading-none select-none transition-colors";

  const variantStyles: Record<string, string> = {
    default:
      "bg-black/5 dark:bg-white/10 text-[var(--default-text)] px-2 py-0.5",
    duration:
      "bg-black/80 text-white backdrop-blur-xs px-2 py-0.5 rounded-full font-mono text-[10px]",
    new: "bg-[var(--default-brand-red)] text-white px-2 py-0.5 uppercase tracking-wider text-[9px]",
    live: "bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider animate-pulse",
    verified: "text-blue-500",
    pro: "bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider",
  };

  return (
    <div
      className={cn(base, variantStyles[variant], className)}
      {...props}
    />
  );
}
