"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2, Eye, Calendar, Loader2, X } from "lucide-react";
import { deleteArticleAction } from "@/modules/articles/article.actions";
import { useRouter } from "next/navigation";

export interface UserArticleItem {
  id: number;
  title: string;
  description: string;
  category: string | null;
  image: string | null;
  views: number | null;
  createdAt: Date;
}

interface MyArticlesClientProps {
  initialArticles: UserArticleItem[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function MyArticlesClient({
  initialArticles,
  currentPage,
  totalPages,
  totalCount,
}: MyArticlesClientProps) {
  const [articlesList, setArticlesList] = useState<UserArticleItem[]>(initialArticles);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    setErrorMsg("");
    try {
      const res = await deleteArticleAction(deleteTargetId);
      if (res.success) {
        setArticlesList((prev) => prev.filter((a) => a.id !== deleteTargetId));
        setDeleteTargetId(null);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to delete article.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while deleting article.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top Header Row matching Reference Screenshot */}
      <div className="flex items-center justify-between pb-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          My articles
        </h1>
        <Link
          href="/create-article"
          className="bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-xs"
        >
          Create article
        </Link>
      </div>

      {/* Empty State matching Reference Screenshot */}
      {articlesList.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <BookOpen className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No posts found!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid of User Articles */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articlesList.map((article) => (
              <div
                key={article.id}
                className="group flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image || "/upload/photos/d-cover.jpg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {article.category && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs capitalize">
                      {article.category}
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <Link
                      href={`/articles/read/${article.id}`}
                      className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-[#04abf2] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {article.description}
                    </p>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg("");
                          setDeleteTargetId(article.id);
                        }}
                        title="Delete article"
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`/my_articles?page_id=${pageNum}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                    pageNum === currentPage
                      ? "bg-[#04abf2] text-white shadow-xs"
                      : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/60"
                  }`}
                >
                  {pageNum}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => !isDeleting && setDeleteTargetId(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !isDeleting && setDeleteTargetId(null)}
              disabled={isDeleting}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Delete article?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete this article? All associated views and comments will also be removed.
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
