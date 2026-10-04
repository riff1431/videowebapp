import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users, movieCategories } from "@/db/schema";
import { eq, desc, and, or, ilike, gte } from "drizzle-orm";
import { Film, Star, Play, Search, Filter } from "lucide-react";
import { getSeoMetadata } from "@/lib/config/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata({ pageKey: "movies", url: "/movies" });
}

interface MoviesPageProps {
  searchParams: Promise<{
    keyword?: string;
    rating?: string;
    release?: string;
    category_?: string;
  }>;
}

export const revalidate = 30;

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const resolvedParams = await searchParams;
  const keyword = resolvedParams.keyword || "";
  const minRating = resolvedParams.rating ? parseFloat(resolvedParams.rating) : 0;
  const releaseYear = resolvedParams.release || "";
  const selectedCat = resolvedParams.category_ || "all";

  // Fetch dynamic movie categories from DB
  const categoriesList = await db
    .select({
      key: movieCategories.key,
      name: movieCategories.name,
    })
    .from(movieCategories)
    .orderBy(movieCategories.name);

  // Build query conditions
  let conditions: any[] = [];

  // Movie filter
  conditions.push(or(eq(videos.isMovie, true), eq(videos.categoryId, "movies"), eq(videos.categoryId, "film")));

  if (selectedCat !== "all") {
    conditions.push(eq(videos.categoryId, selectedCat));
  }

  if (keyword.trim()) {
    conditions.push(ilike(videos.title, `%${keyword.trim()}%`));
  }

  if (minRating > 0) {
    conditions.push(gte(videos.rating, minRating));
  }

  if (releaseYear.trim()) {
    conditions.push(eq(videos.movieRelease, releaseYear.trim()));
  }

  const moviesList = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      rating: videos.rating,
      quality: videos.quality,
      movieRelease: videos.movieRelease,
      categoryId: videos.categoryId,
      stars: videos.stars,
      producer: videos.producer,
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(videos.createdAt))
    .limit(24);

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Filter Sidebar matching PlayTube vid_move_filtr */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Filter className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Filter Movies</h3>
            </div>

            <form method="GET" action="/movies" className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Search Term
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="keyword"
                    defaultValue={keyword}
                    placeholder="Search movie title..."
                    className="w-full h-9 pl-8 pr-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Minimum Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="10"
                  step="0.1"
                  defaultValue={minRating || ""}
                  placeholder="e.g. 7.5"
                  className="w-full h-9 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  name="category_"
                  defaultValue={selectedCat}
                  className="w-full h-9 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Release Year
                </label>
                <input
                  type="number"
                  name="release"
                  min="1960"
                  max="2026"
                  defaultValue={releaseYear}
                  placeholder="e.g. 2024"
                  className="w-full h-9 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-9 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Right Movie Cards Grid matching themes/youplay/layout/movies/list.html */}
        <div className="md:col-span-3">
          {moviesList.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-neutral-900 rounded-xl border border-[var(--border)] space-y-2">
              <Film className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                No movies found matching your filters.
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try searching with a broader title or clearing minimum rating filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moviesList.map((movie) => (
                <div
                  key={movie.id}
                  className="video-card-item group rounded-[22px] p-2.5 transition-all flex flex-col"
                >
                  <Link
                    href={`/watch/${movie.videoId}`}
                    className="relative aspect-[16/10] w-full rounded-[22px] bg-neutral-900 block overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Movie Stars & Quality Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{movie.rating ? Number(movie.rating).toFixed(1) : "N/A"}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-[10px] text-[var(--default-brand-red)] uppercase font-bold">{movie.quality || "HD"}</span>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-[var(--default-brand-red)] text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  <div className="mt-3 px-1 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <Link
                        href={`/watch/${movie.videoId}`}
                        className="font-semibold text-sm text-[var(--default-text)] line-clamp-1 group-hover:text-[var(--default-brand-red)] transition-colors"
                        title={movie.title}
                      >
                        {movie.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--default-muted)] mt-1">
                        <span>{movie.movieRelease || "Feature"}</span>
                        <span>·</span>
                        <span className="capitalize">{movie.categoryId || "Cinema"}</span>
                      </div>
                    </div>

                    {movie.stars && (
                      <p className="text-[11px] text-[var(--default-muted)] line-clamp-1">
                        Cast: {movie.stars}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
