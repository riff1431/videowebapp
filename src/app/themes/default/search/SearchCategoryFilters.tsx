"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SearchCategoryItem {
  id: number;
  name: string;
  key: string;
}

interface SearchCategoryFiltersProps {
  categories: SearchCategoryItem[];
  selectedCat: string;
  query: string;
}

export function SearchCategoryFilters({
  categories,
  selectedCat,
  query,
}: SearchCategoryFiltersProps) {
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
  }, [checkScroll, categories]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const encodedQuery = encodeURIComponent(query);
  const baseHref = `/search?keyword=${encodedQuery}`;

  return (
    <div className="relative group/chips flex-1 min-w-0 flex items-center">
      {/* Prev Button with soft gradient mask */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous categories"
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
        <Link
          href={baseHref}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            !selectedCat
              ? "bg-[var(--default-brand-red)] text-white shadow-xs"
              : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
          }`}
        >
          All Categories
        </Link>
        {categories.map((c) => {
          const isSelected = selectedCat === c.key;
          return (
            <Link
              key={c.key}
              href={`${baseHref}&cat=${encodeURIComponent(c.key)}`}
              className={`px-4 py-1.5 text-xs font-medium rounded-full shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--default-brand-red)] text-white font-semibold shadow-xs"
                  : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Next Button with soft gradient mask */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next categories"
            className="w-8 h-8 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
