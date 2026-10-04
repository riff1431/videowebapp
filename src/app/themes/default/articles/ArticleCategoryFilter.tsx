"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ArticleCategoryItem {
  id: string;
  name: string;
}

interface ArticleCategoryFilterProps {
  categories: ArticleCategoryItem[];
  activeCategory: string;
  currentQuery?: string;
  createButtonHref?: string;
}

export function ArticleCategoryFilter({
  categories,
  activeCategory,
  currentQuery = "",
  createButtonHref,
}: ArticleCategoryFilterProps) {
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

  return (
    <div className="flex items-center gap-4 pb-3 border-b border-[var(--border)]">
      {/* Category Filter Pills Rail with Prev/Next buttons */}
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
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const queryParam = currentQuery.trim()
              ? `&q=${encodeURIComponent(currentQuery.trim())}`
              : "";
            const href =
              cat.id === "all"
                ? currentQuery.trim()
                  ? `/articles?q=${encodeURIComponent(currentQuery.trim())}`
                  : "/articles"
                : `/articles?category=${cat.id}${queryParam}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all ${
                  isActive
                    ? "bg-[#04abf2] text-white shadow-xs"
                    : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                }`}
              >
                {cat.name}
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

      {/* Optional Create Article Button on the far right */}
      {createButtonHref && (
        <div className="shrink-0 pl-2">
          <Link
            href={createButtonHref}
            className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs whitespace-nowrap inline-block"
          >
            Create article
          </Link>
        </div>
      )}
    </div>
  );
}
