"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Users, Flame, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface PopularChannelsFilterProps {
  currentType: string;
  currentTime: string;
}

export function PopularChannelsFilter({
  currentType,
  currentTime,
}: PopularChannelsFilterProps) {
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

  const typeOptions = [
    { key: "views", label: "Views", icon: Eye },
    { key: "subscribers", label: "Subscribers", icon: Users },
    { key: "active", label: "Most active", icon: Flame },
  ];

  const timeOptions = [
    { key: "all_time", label: "All time" },
    { key: "today", label: "Today" },
    { key: "this_week", label: "This week" },
    { key: "this_month", label: "This month" },
    { key: "this_year", label: "This year" },
  ];

  return (
    <div className="relative group/chips flex items-center pb-3 border-b border-[var(--border)]">
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
        {/* Metric Sort Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {typeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentType === opt.key;
            return (
              <Link
                key={opt.key}
                href={`/popular-channels?type=${opt.key}&time=${currentTime}`}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--default-brand-red)] text-white shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Vertical divider between metrics and time window */}
        <div className="h-4 w-px bg-[var(--border)] shrink-0 mx-1" />

        {/* Time Window Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-medium text-[var(--default-muted)] uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Time:</span>
          </span>
          {timeOptions.map((opt) => {
            const isActive = currentTime === opt.key;
            return (
              <Link
                key={opt.key}
                href={`/popular-channels?type=${currentType}&time=${opt.key}`}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--default-brand-red)] text-white font-semibold shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                }`}
              >
                {opt.label}
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
