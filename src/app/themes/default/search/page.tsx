import React from "react";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { db } from "@/db";
import { videos, users, categories } from "@/db/schema";
import { ilike, or, eq, desc, and } from "drizzle-orm";
import { Search as SearchIcon } from "lucide-react";
import { SearchCategoryFilters } from "./SearchCategoryFilters";

interface SearchPageProps {
  searchParams: Promise<{
    keyword?: string;
    q?: string;
    cat?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.keyword || resolvedParams.q || "";
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
      user: {
        username: users.username,
        name: users.name,
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
    <div className="w-full space-y-6">
      {/* Search Filter & Results Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border)] gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full font-medium">
            {results.length} results
          </span>
        </div>

        {/* Category Filter Pills */}
        <SearchCategoryFilters
          categories={allCategories}
          selectedCat={selectedCat}
          query={query}
        />
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-400">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            No videos found matching your search.
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm">
            Try searching with different keywords or clearing category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-4 2xl:gap-5">
          {results.map((v) => (
            <VideoCard
              key={v.id}
              videoId={v.videoId}
              title={v.title}
              thumbnail={v.thumbnail}
              duration={v.duration}
              views={v.views}
              createdAt={v.createdAt}
              user={v.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
