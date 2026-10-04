"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { ShortCard } from "@/app/themes/default/components/media/ShortCard";
import { SectionHeader } from "@/app/themes/default/components/patterns/SectionHeader";
import { GreetingHero } from "@/app/themes/default/components/patterns/GreetingHero";
import { DataState } from "@/app/themes/default/components/patterns/DataState";
import { Sparkles, Flame, Upload } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";

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
  const shortsList = useMemo(() => {
    return featuredVideos.slice(0, 7).map((v) => ({
      id: v.id,
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      views: v.views,
      createdAt: v.createdAt,
    }));
  }, [featuredVideos]);

  return (
    <div className="space-y-8">
      {/* 1. Large Friendly Greeting Header */}
      <GreetingHero name={userName} />

      {/* 2. Category Filter Pills */}
      {categoriesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
      )}

      {/* 3. Recommended Videos Grid */}
      <section>
        <SectionHeader
          title={t("recommended", "Recommended")}
          icon={<Sparkles className="w-4 h-4" />}
          viewMoreHref="/videos/latest"
          viewMoreLabel={t("view_more", "View More >")}
        />

        <DataState
          empty={filteredVideos.length === 0}
          emptyTitle={
            selectedCategoryKey === null
              ? t("no_videos_found", "No videos found for now!")
              : t("no_videos_in_category", "No videos in this category yet.")
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </DataState>
      </section>

      {/* 4. Shorts Rail (7 vertical cards) */}
      {shortsList.length > 0 && (
        <section className="pt-4 border-t border-[var(--border)]/40">
          <SectionHeader
            title={t("shorts", "Shorts")}
            icon={<Flame className="w-4 h-4" />}
            viewMoreHref="/shorts"
            viewMoreLabel={t("view_more", "View More >")}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 scrollbar-none">
            {shortsList.map((short) => (
              <ShortCard key={short.id} short={short} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
