"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { ShortCard } from "@/app/themes/default/components/media/ShortCard";
import { SectionHeader } from "@/app/themes/default/components/patterns/SectionHeader";
import { DataState } from "@/app/themes/default/components/patterns/DataState";
import { useTranslation } from "@/providers/language-provider";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchMoreFeaturedVideosAction } from "@/modules/videos/video.actions";

interface Video {
  id: number;
  videoId: string;
  title: string;
  description: string | null;
  thumbnail: string;
  videoLocation: string;
  duration: string | null;
  views: number | null;
  categoryId: string | null;
  createdAt: Date;
  user: {
    id: number;
    username: string;
    name: string | null;
    avatar: string | null;
    verified: boolean | null;
  };
}

interface Category {
  id: number;
  name: string;
  key: string;
  sortOrder: number | null;
}

interface ShortVideo {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  views: number | null;
  createdAt: Date;
}

interface DefaultHomeClientProps {
  featuredVideos: Video[];
  shortVideos?: ShortVideo[];
  categoriesList: Category[];
  userName?: string | null;
}

export function DefaultHomeClient({
  featuredVideos: initialVideos,
  shortVideos = [],
  categoriesList,
  userName,
}: DefaultHomeClientProps) {
  const { t } = useTranslation();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  // Dynamic videos list with infinite scroll support
  const [videoList, setVideoList] = useState<Video[]>(initialVideos);
  const [hasMore, setHasMore] = useState(initialVideos.length >= 14);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync if initialVideos change
  useEffect(() => {
    setVideoList(initialVideos);
    setHasMore(initialVideos.length >= 14);
  }, [initialVideos]);

  // Load more function on scroll
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchMoreFeaturedVideosAction({
        offset: videoList.length,
        limit: 14,
        categoryId: selectedCategoryKey,
      });
      if (res.success && res.videos) {
        setVideoList((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const newVideos = (res.videos as Video[]).filter((v) => !existingIds.has(v.id));
          return [...prev, ...newVideos];
        });
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, videoList.length, selectedCategoryKey]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, isLoadingMore]);

  const filteredVideos = useMemo(() => {
    if (selectedCategoryKey === null) return videoList;
    return videoList.filter((v) => v.categoryId === selectedCategoryKey);
  }, [videoList, selectedCategoryKey]);

  // Real vertical shorts from backend (isShort = true)
  const allShorts = useMemo(() => {
    return shortVideos;
  }, [shortVideos]);

  // Split filtered videos into chunks of 14 (2 rows in 7-column 4K layout, or 2+ rows on 6-col)
  const videoChunks = useMemo(() => {
    const chunks: Video[][] = [];
    const chunkSize = 14;
    for (let i = 0; i < filteredVideos.length; i += chunkSize) {
      chunks.push(filteredVideos.slice(i, i + chunkSize));
    }
    return chunks;
  }, [filteredVideos]);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categoriesList]);

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
    <div className="space-y-8">
      {/* 1. Category Filter Pills with Conditional Prev/Next buttons */}
      {categoriesList.length > 0 && (
        <div className="relative group/chips flex items-center">
          {/* Prev Button with soft gradient mask */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous categories"
                className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </button>
            </div>
          )}

          {/* Scrollable Chips Rail */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
          >
            <button
              type="button"
              onClick={() => setSelectedCategoryKey(null)}
              className={`px-4 2xl:px-5 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold rounded-full shrink-0 transition-all cursor-pointer ${selectedCategoryKey === null
                ? "bg-[var(--default-brand-red)] text-white shadow-xs"
                : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                }`}
            >
              {t("all", "All")}
            </button>

            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryKey(cat.key)}
                className={`px-4 2xl:px-5 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-medium rounded-full shrink-0 transition-all cursor-pointer ${selectedCategoryKey === cat.key
                  ? "bg-[var(--default-brand-red)] text-white font-semibold shadow-xs"
                  : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Next Button with soft gradient mask */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-[var(--default-panel)] via-[var(--default-panel)]/90 to-transparent">
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next categories"
                className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Interleaved Feed: 2 Rows of Videos -> 1 Row of Shorts -> 2 Rows of Videos... */}
      {filteredVideos.length === 0 ? (
        <DataState
          empty={true}
          emptyTitle={
            selectedCategoryKey === null
              ? t("no_videos_found", "No videos found for now!")
              : t("no_videos_in_category", "No videos in this category yet.")
          }
        >
          <div />
        </DataState>
      ) : (
        videoChunks.map((chunk, chunkIndex) => {
          // Calculate shorts slice for this slot (6-7 shorts per row)
          const shortsSlice = allShorts.slice(
            (chunkIndex * 7) % Math.max(1, allShorts.length),
            ((chunkIndex * 7) % Math.max(1, allShorts.length)) + 7
          );
          const showShortsAfterThisChunk =
            allShorts.length > 0 &&
            (chunkIndex % 1 === 0); // After each 2-row chunk

          return (
            <React.Fragment key={`chunk-section-${chunkIndex}`}>
              {/* 2 Rows of Videos (8 videos) */}
              <section className="space-y-4">
                {chunkIndex === 0 && (
                  <SectionHeader
                    title={t("recommended", "Recommended")}
                    viewMoreHref="/videos/latest"
                    viewMoreLabel={t("view_more", "View More")}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  3xl:grid-cols-6  gap-4 2xl:gap-5">
                  {chunk.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>

              {/* 1 Row of Shorts */}
              {showShortsAfterThisChunk && shortsSlice.length > 0 && (
                <section className="pt-6 pb-2 border-y border-[var(--border)]/40 space-y-4">
                  <SectionHeader
                    title={t("shorts", "Shorts")}
                    viewMoreHref="/shorts"
                    viewMoreLabel={t("view_more", "View More")}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-9 gap-3 2xl:gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {shortsSlice.map((short, shortIdx) => (
                      <ShortCard
                        key={`short-${chunkIndex}-${short.id || shortIdx}`}
                        short={short}
                      />
                    ))}
                  </div>
                </section>
              )}
            </React.Fragment>
          );
        })
      )}

      {/* Infinite Scroll Sentinel & Loading Indicator */}
      <div ref={loadMoreRef} className="py-6 flex items-center justify-center min-h-[50px]">
        {isLoadingMore && (
          <div className="flex items-center gap-2.5 text-sm text-[var(--default-muted)] font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--default-brand-red)]" />
            <span>{t("loading_more", "Loading more videos...")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
