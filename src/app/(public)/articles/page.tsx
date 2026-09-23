import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { Newspaper, Search, Plus, ChevronRight, Eye, Tag } from "lucide-react";

interface ArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export const revalidate = 30;

const ARTICLE_CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "general", name: "General" },
  { id: "tech", name: "Technology" },
  { id: "entertainment", name: "Entertainment" },
  { id: "music", name: "Music" },
  { id: "gaming", name: "Gaming" },
  { id: "news", name: "News & Politics" },
];

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const activeCategory = resolvedParams.category || "all";

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
      tags: articles.tags,
      createdAt: articles.createdAt,
      author: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(articles.id))
    .limit(20);

  // Popular articles for sidebar
  const popularPosts = await db
    .select({
      id: articles.id,
      title: articles.title,
      views: articles.views,
      image: articles.image,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(eq(articles.active, true))
    .orderBy(desc(articles.views))
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header bar matching PlayTube pt_page_headr */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Articles & Blogs
            </h1>
            <p className="text-xs text-neutral-500">
              Explore opinions, editorial deep-dives, and community stories
            </p>
          </div>
        </div>

        <Link
          href="/create-article"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Article</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8">
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-12 text-center">
              <Newspaper className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                No articles published yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
                Be the first writer to publish an editorial piece or blog article for the community!
              </p>
              <Link
                href="/create-article"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish First Article
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <Link href={`/articles/read/${post.id}`} className="relative block aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.image || "/upload/photos/d-cover.jpg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                      {post.category || "General"}
                    </span>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/articles/read/${post.id}`}>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-[var(--primary)] transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 mt-1.5 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author?.avatar || "/upload/photos/d-avatar.jpg"}
                          alt={post.author?.name || "Author"}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {post.author?.name || post.author?.username || "PlayTube Creator"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.views || 0}
                        </span>
                        <Link
                          href={`/articles/read/${post.id}`}
                          className="text-[var(--primary)] font-semibold inline-flex items-center hover:underline"
                        >
                          Read <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Article Search Box */}
          <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">
              Search Articles
            </h3>
            <form action="/articles" method="GET" className="relative flex items-center">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Keywords or topics..."
                className="w-full h-9 pl-3 pr-10 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-[var(--primary)]"
              />
              {activeCategory !== "all" && (
                <input type="hidden" name="category" value={activeCategory} />
              )}
              <button
                type="submit"
                aria-label="Search articles"
                className="absolute right-1 top-1 w-7 h-7 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-md flex items-center justify-center cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Categories Filter */}
          <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">
              Categories
            </h3>
            <div className="flex flex-col space-y-1">
              {ARTICLE_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={cat.id === "all" ? "/articles" : `/articles?category=${cat.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-400"}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Most Popular Posts */}
          {popularPosts.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">
                Most Popular
              </h3>
              <div className="space-y-3">
                {popularPosts.map((pop) => (
                  <Link
                    key={pop.id}
                    href={`/articles/read/${pop.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                      <img
                        src={pop.image || "/upload/photos/d-cover.jpg"}
                        alt={pop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-[var(--primary)] line-clamp-2 transition-colors">
                        {pop.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {pop.views || 0} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
