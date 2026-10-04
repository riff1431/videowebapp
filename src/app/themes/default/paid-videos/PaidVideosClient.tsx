"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Video, Film, Clapperboard, Disc, VideoOff, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";

type TabType = "videos" | "movies" | "rented_movies" | "rented_videos";

interface VideoItem {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: string | null;
  views?: number | null;
  createdAt: Date;
  isMovie?: boolean | null;
  user: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
}

interface PaidVideosClientProps {
  purchasedVideos: VideoItem[];
  purchasedMovies: VideoItem[];
  rentedMovies: VideoItem[];
  rentedVideos: VideoItem[];
  initialTab?: TabType;
}

export function PaidVideosClient({
  purchasedVideos = [],
  purchasedMovies = [],
  rentedMovies = [],
  rentedVideos = [],
  initialTab = "videos",
}: PaidVideosClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
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

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "videos", label: "Videos", icon: Video },
    { key: "movies", label: "Movies", icon: Film },
    { key: "rented_movies", label: "Rented Movies", icon: Clapperboard },
    { key: "rented_videos", label: "Rented Videos", icon: Disc },
  ];

  let currentItems: VideoItem[] = [];
  let emptyMessage = "No paid videos found";

  if (activeTab === "videos") {
    currentItems = purchasedVideos;
    emptyMessage = "No paid videos found";
  } else if (activeTab === "movies") {
    currentItems = purchasedMovies;
    emptyMessage = "No paid movies found";
  } else if (activeTab === "rented_movies") {
    currentItems = rentedMovies;
    emptyMessage = "No rented movies found";
  } else if (activeTab === "rented_videos") {
    currentItems = rentedVideos;
    emptyMessage = "No rented videos found";
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Filter Rail: Pills with prev/next buttons (matching Popular Channels filter) */}
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#04abf2] text-white shadow-xs"
                      : "bg-black/5 dark:bg-white/5 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
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

      {/* Empty State or Video Grid */}
      {currentItems.length === 0 ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6 gap-4">
          {currentItems.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              views={video.views}
              createdAt={video.createdAt}
              user={video.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
