import React from "react";
import Link from "next/link";
import { getFeaturedVideos, getCategories } from "@/services/video.service";
import { VideoCard } from "@/components/common/VideoCard";
import { Flame, Sparkles } from "lucide-react";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [featuredVideos, categoriesList] = await Promise.all([
    getFeaturedVideos(12),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      {categoriesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[var(--primary)] text-white shrink-0 shadow-xs"
          >
            All
          </Link>
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.key}`}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-[var(--border)] shrink-0 transition-colors shadow-2xs"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Hero / Banner for Empty or Initial state */}
      {featuredVideos.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-[var(--primary)] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Welcome to PlayTube</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1 mb-4">
            The platform is connected to PostgreSQL on Supabase. Upload your first video or migrate your MySQL database!
          </p>
          <Link
            href="/upload-video"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors"
          >
            Upload Video
          </Link>
        </div>
      )}

      {/* Video Grid */}
      {featuredVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Featured & Latest</h2>
            </div>
            <Link href="/videos/latest" className="text-xs font-semibold text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
