import React from "react";
import { Skeleton } from "@/app/themes/default/components/ui/skeleton";
import { AlertCircle, FolderOpen } from "lucide-react";

interface DataStateProps {
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  error?: string | null;
  children: React.ReactNode;
  skeletonCount?: number;
}

export function DataState({
  loading,
  empty,
  emptyTitle = "No items found",
  emptyDescription,
  error,
  children,
  skeletonCount = 8,
}: DataStateProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-3 p-2">
            <Skeleton className="w-full aspect-video rounded-[22px]" />
            <div className="flex gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-[22px] border border-red-500/20 bg-red-500/5 my-6">
        <AlertCircle className="w-8 h-8 text-[var(--default-brand-red)] mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[var(--default-text)]">{error}</h3>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="p-12 text-center rounded-[22px] border border-dashed border-[var(--border)] my-6">
        <FolderOpen className="w-8 h-8 text-[var(--default-muted)] mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[var(--default-text)] mb-1">
          {emptyTitle}
        </h3>
        {emptyDescription && (
          <p className="text-xs text-[var(--default-muted)]">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
