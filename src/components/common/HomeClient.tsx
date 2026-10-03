"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { VideoCard } from "@/components/common/VideoCard";
import { VideoOff, Upload } from "lucide-react";

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

interface HomeClientProps {
  featuredVideos: Video[];
  categoriesList: Category[];
}

export function HomeClient({ featuredVideos, categoriesList }: HomeClientProps) {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (selectedCategoryKey === null) return featuredVideos;
    return featuredVideos.filter((v) => v.categoryId === selectedCategoryKey);
  }, [featuredVideos, selectedCategoryKey]);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      {categoriesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* All pill */}
          <button
            onClick={() => setSelectedCategoryKey(null)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 shadow-xs transition-colors ${
              selectedCategoryKey === null
                ? "bg-[#04abf2] text-white"
                : "bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border)]"
            }`}
          >
            All
          </button>

          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryKey(cat.key)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full shrink-0 transition-colors shadow-2xs ${
                selectedCategoryKey === cat.key
                  ? "bg-[#04abf2] text-white font-semibold"
                  : "bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl py-20 px-4 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--muted)] mb-4">
            <VideoOff className="w-8 h-8" />
          </div>

          <h3 className="text-sm md:text-base font-semibold text-[var(--foreground)] mb-4">
            {selectedCategoryKey === null
              ? "No videos found for now!"
              : "No videos in this category yet."}
          </h3>

          {selectedCategoryKey === null && (
            <Link
              href="/import-video"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2c2c2c] dark:hover:bg-[#383838] text-neutral-800 dark:text-white text-xs font-medium rounded-md transition-colors border border-[var(--border)] shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </Link>
          )}
        </div>
      )}

      {/* Video Grid */}
      {filteredVideos.length > 0 && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                videoId={video.videoId}
                title={video.title}
                thumbnail={video.thumbnail ?? undefined}
                duration={video.duration ?? undefined}
                views={video.views}
                createdAt={video.createdAt}
                user={{
                  username: video.user.username,
                  name: video.user.name,
                  avatar: video.user.avatar,
                  verified: video.user.verified,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
