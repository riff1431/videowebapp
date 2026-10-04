"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BarChart2, Calendar } from "lucide-react";

interface TopVideosFilterProps {
  currentType: string;
}

export function TopVideosFilter({ currentType }: TopVideosFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const timeOptions = [
    { key: "all", label: "All Time", icon: BarChart2 },
    { key: "today", label: "Today", icon: Calendar },
    { key: "this_week", label: "This week", icon: Calendar },
    { key: "this_month", label: "This month", icon: Calendar },
    { key: "this_year", label: "This year", icon: Calendar },
  ];

  return (
    <div className="relative group/chips flex items-center pb-3 border-b border-[var(--border)] mb-6">
      {/* Prev Button with soft gradient mask */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous filters"
            className="w-8 h-8 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrollable Chips Rail */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          {timeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentType === opt.key;
            const href = opt.key === "all" ? "/videos/top" : `/videos/top?type=${opt.key}`;

            return (
              <Link
                key={opt.key}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#04abf2] text-white shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Next Button with soft gradient mask */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next filters"
            className="w-8 h-8 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
