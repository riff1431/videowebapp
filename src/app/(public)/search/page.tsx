import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users, categories } from "@/db/schema";
import { ilike, or, eq, desc, and } from "drizzle-orm";
import { Filter, Search as SearchIcon } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const selectedCat = resolvedParams.cat || "";

  // Query categories
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);

  // Search videos
  let searchConditions = [];
  if (query.trim()) {
    searchConditions.push(
      or(
        ilike(videos.title, `%${query.trim()}%`),
        ilike(videos.description, `%${query.trim()}%`)
      )
    );
  }

  if (selectedCat) {
    searchConditions.push(eq(videos.categoryId, selectedCat));
  }

  const results = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      createdAt: videos.createdAt,
      channel: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(searchConditions.length > 0 ? and(...searchConditions) : undefined)
    .orderBy(desc(videos.createdAt))
    .limit(30);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PlayTube Search Header matching themes/youplay/layout/search/content.html */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {query ? `"${query}"` : "All Videos"}
            </h1>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-medium">
              {results.length} results
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                !selectedCat
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All Categories
            </Link>
            {allCategories.map((c) => (
              <Link
                key={c.key}
                href={`/search?q=${encodeURIComponent(query)}&cat=${c.key}`}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                  selectedCat === c.key
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              No videos found matching your search.
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Try searching with different keywords or clearing category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {results.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
