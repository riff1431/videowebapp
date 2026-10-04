import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { articles, users, categories } from "@/db/schema";
import { eq, desc, and, ilike, asc } from "drizzle-orm";
import { Newspaper, Search, BookOpen } from "lucide-react";

interface ArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export const revalidate = 30;

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const activeCategory = resolvedParams.category || "all";

  const dbCategories = await db
    .select({
      id: categories.id,
      key: categories.key,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  const articleCategories = [
    { id: "all", name: "All Categories" },
    ...dbCategories.map((c) => ({ id: c.key, name: c.name })),
  ];

  // Build conditions
  const conditions = [eq(articles.active, true)];
  if (activeCategory !== "all") {
    conditions.push(eq(articles.category, activeCategory));
  }
  if (query.trim()) {
    conditions.push(ilike(articles.title, `%${query.trim()}%`));
  }

  const posts = await db
    .select({
      id: articles.id,
      title: articles.title,
      description: articles.description,
      category: articles.category,
      image: articles.image,
      views: articles.views,
      createdAt: articles.createdAt,
      author: {
        username: users.username,
        name: users.name,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(articles.id))
    .limit(20);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#04abf2] text-white flex items-center justify-center">
            <Newspaper className="w-4 h-4" />
          </div>
          <h1 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            Most recent articles
          </h1>
        </div>

        <Link
          href="/create-article"
          className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors"
        >
          Create article
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[350px]">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              {/* Circular light blue icon badge */}
              <div className="w-24 h-24 rounded-full bg-[#e1f5fe] dark:bg-[#1e293b] flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-[#04abf2]" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                No posts found!
              </h3>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="video-card-item group rounded-[22px] p-2.5 transition-all"
                >
                  <Link href={`/articles/read/${post.id}`} className="block aspect-video rounded-[22px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.image || "/upload/photos/d-cover.jpg"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <div className="mt-3 px-1">
                    <Link href={`/articles/read/${post.id}`}>
                      <h2 className="text-sm font-semibold text-[var(--default-text)] line-clamp-2 group-hover:text-[var(--default-brand-red)] transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-[var(--default-muted)] mt-1 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Article Search Box */}
          <div className="bg-white dark:bg-[#212121] border border-[var(--border)] rounded-lg p-3 shadow-xs">
            <form action="/articles" method="GET" className="relative flex items-center bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md overflow-hidden h-9">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search for articles"
                className="w-full h-full pl-3 pr-2 text-xs bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
              />
              <button
                type="submit"
                aria-label="Search articles"
                className="h-full px-3.5 bg-[#04abf2] hover:bg-[#039be5] text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Categories Pill Cloud */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {articleCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={cat.id === "all" ? "/articles" : `/articles?category=${cat.id}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#04abf2] text-white shadow-xs"
                        : "bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#333333] border border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Most Popular */}
          <div className="pt-2 border-t border-[var(--border)]">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-3">
              Most popular
            </h3>
            <p className="text-xs text-neutral-400">No popular articles yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
