import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "pill" | "pill-active" | "subtle";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles: Record<string, string> = {
      default:
        "bg-[var(--default-brand-red)] text-white hover:bg-[#d90429] shadow-xs",
      ghost:
        "text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10",
      outline:
        "border border-[var(--border)] bg-transparent text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10",
      pill:
        "rounded-full bg-[var(--default-search-bg)] text-[var(--default-muted)] hover:text-[var(--default-text)] border border-[var(--default-search-border)]",
      "pill-active":
        "rounded-full bg-[var(--default-brand-red)] text-white font-semibold shadow-xs",
      subtle:
        "bg-black/5 dark:bg-white/10 text-[var(--default-text)] hover:bg-black/10 dark:hover:bg-white/15",
    };

    const sizeStyles: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-[11px]",
      lg: "h-10 rounded-md px-8 text-sm",
      icon: "h-9 w-9 p-0 rounded-full",
      pill: "h-8 px-4 py-1 text-xs rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
