"use client";

import React, { useState, useMemo } from "react";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { ShortCard } from "@/app/themes/default/components/media/ShortCard";
import { SectionHeader } from "@/app/themes/default/components/patterns/SectionHeader";
import { DataState } from "@/app/themes/default/components/patterns/DataState";
import { useTranslation } from "@/providers/language-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

interface DefaultHomeClientProps {
  featuredVideos: Video[];
  categoriesList: Category[];
  userName?: string | null;
}

export function DefaultHomeClient({
  featuredVideos,
  categoriesList,
  userName,
}: DefaultHomeClientProps) {
  const { t } = useTranslation();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (selectedCategoryKey === null) return featuredVideos;
    return featuredVideos.filter((v) => v.categoryId === selectedCategoryKey);
  }, [featuredVideos, selectedCategoryKey]);

  // Derive shorts (e.g. videos with duration under 60s or sample rail slice)
  const allShorts = useMemo(() => {
    return featuredVideos.map((v) => ({
      id: v.id,
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      views: v.views,
      createdAt: v.createdAt,
    }));
  }, [featuredVideos]);

  // Split filtered videos into chunks of 8 (2 rows in 4-column layout)
  const videoChunks = useMemo(() => {
    const chunks: Video[][] = [];
    for (let i = 0; i < filteredVideos.length; i += 8) {
      chunks.push(filteredVideos.slice(i, i + 8));
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
            <button
              type="button"
              onClick={() => setSelectedCategoryKey(null)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                selectedCategoryKey === null
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
                className={`px-4 py-1.5 text-xs font-medium rounded-full shrink-0 transition-all cursor-pointer ${
                  selectedCategoryKey === cat.key
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
                className="w-8 h-8 rounded-full bg-white dark:bg-[#202020] text-[var(--default-text)] shadow-md hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
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
                    viewMoreLabel={t("view_more", "View More >")}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    viewMoreLabel={t("view_more", "View More >")}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 scrollbar-none">
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
    </div>
  );
}
