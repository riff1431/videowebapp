import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { articles, articleComments, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Eye, Share2, Calendar, User, MessageSquare, ArrowLeft, Send } from "lucide-react";
import { postArticleCommentAction } from "@/modules/articles/article.actions";

interface ReadArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 30;

export default async function ReadArticlePage({ params }: ReadArticlePageProps) {
  const resolvedParams = await params;
  const articleId = parseInt(resolvedParams.id, 10);

  if (isNaN(articleId)) {
    notFound();
  }

  // Fetch article with author
  const [post] = await db
    .select({
      id: articles.id,
      title: articles.title,
      description: articles.description,
      text: articles.text,
      category: articles.category,
      image: articles.image,
      tags: articles.tags,
      views: articles.views,
      shared: articles.shared,
      createdAt: articles.createdAt,
      author: {
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!post) {
    notFound();
  }

  // Increment view counter
  await db
    .update(articles)
    .set({ views: (post.views || 0) + 1 })
    .where(eq(articles.id, articleId));

  // Fetch comments
  const commentsList = await db
    .select({
      id: articleComments.id,
      text: articleComments.text,
      createdAt: articleComments.createdAt,
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(articleComments)
    .leftJoin(users, eq(articleComments.userId, users.id))
    .where(eq(articleComments.articleId, articleId))
    .orderBy(desc(articleComments.id));

  // Related articles in same category
  const related = await db
    .select({
      id: articles.id,
      title: articles.title,
      image: articles.image,
      views: articles.views,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(and(eq(articles.category, post.category || "general"), eq(articles.active, true)))
    .orderBy(desc(articles.id))
    .limit(4);

  async function handleCommentSubmit(formData: FormData) {
    "use server";
    const commentText = formData.get("comment") as string;
    if (commentText) {
      await postArticleCommentAction(articleId, commentText);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>

      {/* Article Header matching PlayTube read-article-head */}
      <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
        {/* Featured hero image banner */}
        <div className="relative w-full h-72 sm:h-96 bg-neutral-900 overflow-hidden">
          <img
            src={post.image || "/upload/photos/d-cover.jpg"}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[var(--primary)] text-white mb-3">
              {post.category || "General"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Author / Metadata strip */}
        <div className="p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="flex items-center gap-3">
            <Link href={`/channel/${post.author?.username || "admin"}`}>
              <img
                src={post.author?.avatar || "/upload/photos/d-avatar.jpg"}
                alt={post.author?.name || "Author"}
                className="w-11 h-11 rounded-full object-cover border-2 border-[var(--primary)]/20"
              />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/channel/${post.author?.username || "admin"}`}
                  className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[var(--primary)] transition-colors"
                >
                  {post.author?.name || post.author?.username || "PlayTube Creator"}
                </Link>
                {post.author?.verified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary)] text-white inline-flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views || 0} views
                </span>
              </p>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#1877F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#1DA1F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Twitter
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="p-6 sm:p-8 prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed space-y-4">
          <div className="text-base font-semibold text-neutral-600 dark:text-neutral-300 italic border-l-4 border-[var(--primary)] pl-4 py-1 mb-6 bg-neutral-50 dark:bg-neutral-800/60 rounded-r-lg">
            {post.description}
          </div>

          <div className="whitespace-pre-line leading-loose text-neutral-800 dark:text-neutral-200">
            {post.text}
          </div>

          {post.tags && (
            <div className="pt-6 mt-6 border-t border-[var(--border)] flex flex-wrap gap-2">
              {post.tags.split(",").map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md text-xs font-medium"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8 bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
          <span>Comments ({commentsList.length})</span>
        </h3>

        {/* Comment input form */}
        <form action={handleCommentSubmit} className="flex gap-3 mb-8">
          <textarea
            name="comment"
            rows={2}
            required
            placeholder="Add your thoughts or join the discussion..."
            className="flex-1 p-3 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] resize-none"
          />
          <button
            type="submit"
            className="px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </form>

        {/* Comments Feed */}
        {commentsList.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">
            No comments yet. Be the first to share what you think!
          </p>
        ) : (
          <div className="space-y-4">
            {commentsList.map((comm) => (
              <div key={comm.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40">
                <img
                  src={comm.user?.avatar || "/upload/photos/d-avatar.jpg"}
                  alt={comm.user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {comm.user?.name || comm.user?.username || "Viewer"}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                    {comm.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
