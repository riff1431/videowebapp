import React from "react";
import Link from "next/link";
import { getFeaturedVideos, getCategories } from "@/services/video.service";
import { VideoCard } from "@/components/common/VideoCard";
import { VideoOff, Upload } from "lucide-react";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [featuredVideos, categoriesList] = await Promise.all([
    getFeaturedVideos(12),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Category Pills (if present) */}
      {categoriesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#04abf2] text-white shrink-0 shadow-xs"
          >
            All
          </Link>
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.key}`}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border)] shrink-0 transition-colors shadow-2xs"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Empty State Card matching PlayTube Screenshot 1 & 5 */}
      {featuredVideos.length === 0 && (
        <div className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl py-20 px-4 flex flex-col items-center justify-center text-center shadow-xs">
          {/* Circular Camera Off Icon */}
          <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--muted)] mb-4">
            <VideoOff className="w-8 h-8" />
          </div>

          <h3 className="text-sm md:text-base font-semibold text-[var(--foreground)] mb-4">
            No videos found for now!
          </h3>

          {/* Import Button */}
          <Link
            href="/import-video"
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2c2c2c] dark:hover:bg-[#383838] text-neutral-800 dark:text-white text-xs font-medium rounded-md transition-colors border border-[var(--border)] shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </Link>
        </div>
      )}

      {/* Video Grid */}
      {featuredVideos.length > 0 && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {featuredVideos.map((video) => (
              <VideoCard
                key={video.id}
                videoId={video.videoId}
                title={video.title}
                thumbnail={video.thumbnail}
                duration={video.duration}
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
