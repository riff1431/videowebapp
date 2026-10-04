"use client";

import React from "react";
import { Skeleton } from "@/app/themes/default/components/ui/skeleton";

export function ShortsSkeleton() {
  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-12rem)] py-2 select-none">
      <div className="relative flex items-end gap-3 sm:gap-4 max-w-full">
        {/* Main 9:16 Video Skeleton */}
        <div className="relative w-[340px] sm:w-[380px] md:w-[410px] h-[610px] sm:h-[680px] bg-neutral-900 rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl flex flex-col justify-end p-5">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-24 h-3.5 rounded-full" />
              <Skeleton className="w-16 h-3 rounded-full" />
            </div>
            <Skeleton className="w-20 h-7 rounded-full" />
          </div>
          <Skeleton className="w-3/4 h-4 rounded-full mb-1.5" />
          <Skeleton className="w-1/2 h-3.5 rounded-full" />
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex flex-col items-center gap-4 pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 rounded-full" />
              <Skeleton className="w-6 h-2.5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShortsEmpty() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h3 className="text-lg font-bold text-[var(--default-text)]">No Shorts Available</h3>
      <p className="text-xs text-[var(--default-muted)] mt-1 max-w-sm">
        There are currently no vertical short videos uploaded yet.
      </p>
    </div>
  );
}

export function ShortsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-3">
      <p className="text-sm font-semibold text-red-500">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-full bg-[var(--default-brand-red)] text-white text-xs font-semibold"
      >
        Retry
      </button>
    </div>
  );
}
