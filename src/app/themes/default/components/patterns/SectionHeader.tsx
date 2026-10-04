import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  viewMoreHref?: string;
  viewMoreLabel?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  icon,
  viewMoreHref,
  viewMoreLabel = "View More",
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--default-brand-red)]">{icon}</span>}
        <h2 className="text-base sm:text-lg font-bold text-[var(--default-text)] tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {children}
        {viewMoreHref && (
          <Link
            href={viewMoreHref}
            className="group inline-flex items-center gap-1 text-xs font-medium text-[var(--default-muted)] hover:text-[var(--default-text)] transition-colors"
          >
            <span>{viewMoreLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
