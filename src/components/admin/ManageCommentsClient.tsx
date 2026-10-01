"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteCommentAction,
  bulkDeleteCommentsAction,
} from "@/modules/admin/videos.actions";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface AdminCommentItem {
  id: number;
  text: string;
  createdAt: Date;
  video: {
    id: number;
    videoId: string;
    title: string;
  } | null;
  user: {
    id: number;
    username: string;
    avatar: string | null;
  } | null;
}

interface ManageCommentsClientProps {
  initialComments: AdminCommentItem[];
}

export function ManageCommentsClient({
  initialComments,
}: ManageCommentsClientProps) {
  const [commentsList, setCommentsList] = useState<AdminCommentItem[]>(initialComments);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const limitPerPage = 50;

  // Filter
  const filtered = commentsList.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.id.toString() === query ||
      c.text.toLowerCase().includes(query) ||
      c.video?.title.toLowerCase().includes(query) ||
      c.video?.videoId.toLowerCase().includes(query) ||
      c.user?.username.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limitPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * limitPerPage,
    currentPage * limitPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one comment");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected comment(s)?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await bulkDeleteCommentsAction(selectedIds);
      if (res.success) {
        setCommentsList((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      } else {
        alert(res.error || "Failed to delete comments");
      }
    });
  };

  const handleSingleDelete = (id: number) => {
    startTransition(async () => {
      const res = await deleteCommentAction(id);
      if (res.success) {
        setCommentsList((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert(res.error || "Failed to delete comment");
      }
    });
  };

  const formatDate = (date: Date) => {
    try {
      const d = new Date(date);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = months[d.getMonth()];
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      return `${month}-${day}-${year}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Video Comments
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="text-[#04abf2] hover:underline">
            Admin Panel
          </Link>
          <span>/</span>
          <span>Videos</span>
          <span>/</span>
          <span className="text-neutral-700 dark:text-neutral-200">
            Manage Video Comments
          </span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        {/* Card Header matching screenshot */}
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
            Manage Video Comments
          </h6>
          <button
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
            }}
            className="px-6 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors cursor-pointer"
          >
            All
          </button>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="p-5 pb-4 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keyword, ID, Title"
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table matching screenshot */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider bg-neutral-50/50 dark:bg-[#181a1d]/50">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === paginated.length && paginated.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-16 border-r border-neutral-200 dark:border-[#292d33]">
                  ID
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  TEXT
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  VIDEO
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  ARTICLES
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  POSTED ON
                </th>
                <th className="py-3 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-neutral-500 dark:text-neutral-400 text-xs"
                  >
                    No comments found
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const isChecked = selectedIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {c.id}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] max-w-xs">
                        <p className="text-neutral-800 dark:text-neutral-200 line-clamp-2">
                          {c.text}
                        </p>
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        {c.video ? (
                          <Link
                            href={`/watch/${c.video.videoId}`}
                            target="_blank"
                            className="text-[#04abf2] hover:underline flex items-center gap-1 font-medium truncate max-w-[200px]"
                            title={c.video.title}
                          >
                            {c.video.title || c.video.videoId}
                          </Link>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] text-neutral-400">
                        -
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination & Bulk Delete matching screenshot */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#292d33] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing {paginated.length > 0 ? (currentPage - 1) * limitPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * limitPerPage, filtered.length)} of {filtered.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>

        {/* Bulk Delete Button matching screenshot */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || isPending}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Delete Single Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full shadow-2xl overflow-hidden p-5 space-y-4">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Comment?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSingleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
