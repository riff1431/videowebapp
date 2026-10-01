"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteArticleAction,
  bulkArticleAction,
} from "@/modules/admin/articles.actions";
import {
  Home,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AdminDateRangePicker,
  DateRangeOption,
  filterByDateRange,
} from "@/components/admin/AdminDateRangePicker";

export interface AdminArticleItem {
  id: number;
  title: string;
  description: string;
  categoryKey: string;
  categoryName: string;
  tags: string;
  active: boolean;
  image: string;
  views: number;
  createdAt: Date;
}

interface ManageArticlesClientProps {
  initialArticles: AdminArticleItem[];
}

export function ManageArticlesClient({ initialArticles }: ManageArticlesClientProps) {
  const [articlesList, setArticlesList] = useState<AdminArticleItem[]>(initialArticles);
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("All");
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<"id" | "title" | "category" | "date" | "status">("id");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkActionType, setBulkActionType] = useState<"activate" | "deactivate" | "delete">("activate");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const limitPerPage = 50;

  // Filter by Date Range
  const dateFiltered = filterByDateRange(articlesList, dateRange, customRange);

  // Filter by Query (Tags, Title, Description)
  const filtered = dateFiltered.filter((a) => {
    if (!activeQuery.trim()) return true;
    const q = activeQuery.toLowerCase();
    return (
      a.id.toString() === q ||
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags.toLowerCase().includes(q)
    );
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "id") {
      return sortAsc ? a.id - b.id : b.id - a.id;
    } else if (sortField === "title") {
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    } else if (sortField === "category") {
      return sortAsc
        ? a.categoryName.localeCompare(b.categoryName)
        : b.categoryName.localeCompare(a.categoryName);
    } else if (sortField === "status") {
      const valA = a.active ? 1 : 0;
      const valB = b.active ? 1 : 0;
      return sortAsc ? valA - valB : valB - valA;
    } else {
      // date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / limitPerPage));
  const paginated = sorted.slice(
    (currentPage - 1) * limitPerPage,
    currentPage * limitPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: "id" | "title" | "category" | "date" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const handleDeleteOne = (id: number) => {
    startTransition(async () => {
      const res = await deleteArticleAction(id);
      if (res.success) {
        setArticlesList((prev) => prev.filter((a) => a.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setDeleteConfirmId(null);
      } else {
        alert(res.error || "Failed to delete article");
      }
    });
  };

  const handleBulkSubmit = () => {
    if (selectedIds.length === 0) return;

    if (bulkActionType === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

    startTransition(async () => {
      const res = await bulkArticleAction(selectedIds, bulkActionType);
      if (res.success) {
        setArticlesList((prev) =>
          prev.map((a) =>
            selectedIds.includes(a.id)
              ? { ...a, active: bulkActionType === "activate" }
              : a
          )
        );
        setSelectedIds([]);
      } else {
        alert(res.error || "Bulk action failed");
      }
    });
  };

  const executeBulkDelete = () => {
    startTransition(async () => {
      const res = await bulkArticleAction(selectedIds, "delete");
      if (res.success) {
        setArticlesList((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
        setShowBulkDeleteModal(false);
      } else {
        alert(res.error || "Bulk delete failed");
      }
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Breadcrumb */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Articles
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span className="hover:underline">Articles</span>
          <span>&gt;</span>
          <span className="text-[#04abf2] font-semibold">Manage Articles</span>
        </nav>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm p-6 relative">
        {/* Top Header Row: Manage & Edit Articles and DateRangePicker matching Screenshot 3 */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#292d33] mb-5">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Manage & Edit Articles
          </h6>
          <AdminDateRangePicker
            value={dateRange}
            onChange={(val, custom) => {
              setDateRange(val);
              setCustomRange(custom);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Search Filter Form matching Screenshot 3 */}
        <div className="mb-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 max-w-xl">
            <div className="w-full space-y-1">
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Search for Tags, Title, Description
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder=""
                className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Articles Table matching Screenshot 3 */}
        <div className="overflow-x-auto border border-neutral-200 dark:border-[#292d33] rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#181a1d] border-b border-neutral-200 dark:border-[#292d33] text-neutral-600 dark:text-neutral-400 font-semibold select-none">
              <tr>
                <th className="w-12 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginated.length > 0 &&
                      paginated.every((a) => selectedIds.includes(a.id))
                    }
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-[#04abf2] rounded cursor-pointer"
                  />
                </th>

                {/* ID Column */}
                <th className="w-20 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold"
                  >
                    <span>ID</span>
                    {sortField === "id" ? (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#04abf2]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#04abf2]" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>

                {/* TITLE Column */}
                <th className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold"
                  >
                    <span>TITLE</span>
                    {sortField === "title" ? (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#04abf2]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#04abf2]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>

                {/* CATEGORY Column */}
                <th className="w-40 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold"
                  >
                    <span>CATEGORY</span>
                    {sortField === "category" ? (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#04abf2]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#04abf2]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>

                {/* DATE Column */}
                <th className="w-36 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold"
                  >
                    <span>DATE</span>
                    {sortField === "date" ? (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#04abf2]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#04abf2]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>

                {/* STATUS Column */}
                <th className="w-28 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold"
                  >
                    <span>STATUS</span>
                    {sortField === "status" ? (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#04abf2]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#04abf2]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>

                {/* ACTION Column */}
                <th className="w-24 px-3 py-2.5 text-center">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No articles found.
                  </td>
                </tr>
              ) : (
                paginated.map((article) => {
                  const isChecked = selectedIds.includes(article.id);
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2227]/50 transition-colors"
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(article.id)}
                          className="w-3.5 h-3.5 accent-[#04abf2] rounded cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400 font-medium">
                        {article.id}
                      </td>

                      <td className="px-3 py-2 font-medium text-neutral-900 dark:text-neutral-100">
                        <a
                          href={`/articles/${article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#04abf2] transition-colors"
                        >
                          {article.title}
                        </a>
                      </td>

                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                        {article.categoryName}
                      </td>

                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                        {formatDate(article.createdAt)}
                      </td>

                      <td className="px-3 py-2">
                        {article.active ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/edit-article?id=${article.id}`}
                            className="p-1 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(article.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Showing X out of Y & Pagination Controls matching Screenshot 3 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 text-xs text-neutral-600 dark:text-neutral-400">
          <div>
            Showing {currentPage} out of {totalPages}
          </div>

          <div className="flex items-center gap-1 select-none">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#25282e] disabled:opacity-40 cursor-pointer"
              title="First Page"
            >
              <span className="font-bold text-[11px]">&lt;&lt;</span>
            </button>

            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#25282e] disabled:opacity-40 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Number pill */}
            <div className="w-6 h-6 rounded-full bg-[#04abf2] text-white flex items-center justify-center font-bold text-xs">
              {currentPage}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#25282e] disabled:opacity-40 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-[#25282e] disabled:opacity-40 cursor-pointer"
              title="Last Page"
            >
              <span className="font-bold text-[11px]">&gt;&gt;</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Action dropdown and Submit button matching Screenshot 3 */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-[#292d33] flex flex-col sm:flex-row items-start sm:items-end gap-3 max-w-sm">
          <div className="w-full space-y-1">
            <span className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Action
            </span>
            <div className="relative">
              <select
                value={bulkActionType}
                onChange={(e) =>
                  setBulkActionType(e.target.value as "activate" | "deactivate" | "delete")
                }
                className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] transition-colors appearance-none cursor-pointer"
              >
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0 || isPending}
            onClick={handleBulkSubmit}
            className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Article?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this article?
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
                disabled={isPending}
                onClick={() => handleDeleteOne(deleteConfirmId)}
                className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Article?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure that you want to remove the selected Article(s)?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={executeBulkDelete}
                className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
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
