"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMovieAction, bulkDeleteMoviesAction } from "@/modules/admin/movies.actions";
import { Edit, Trash2, Home, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

import {
  AdminDateRangePicker,
  DateRangeOption,
  filterByDateRange,
} from "@/components/admin/AdminDateRangePicker";

export interface AdminMovieItem {
  id: number;
  videoId: string;
  title: string;
  movieRelease: string | null;
  createdAt: Date;
}

interface ManageMoviesClientProps {
  initialMovies: AdminMovieItem[];
}

export function ManageMoviesClient({ initialMovies }: ManageMoviesClientProps) {
  const [moviesList, setMoviesList] = useState<AdminMovieItem[]>(initialMovies);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("All");
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<"id" | "title">("id");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const limitPerPage = 50;

  // Filter by Keyword and Date Range
  const dateFiltered = filterByDateRange(moviesList, dateRange, customRange);

  const filtered = dateFiltered.filter((m) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      m.id.toString() === query ||
      m.title.toLowerCase().includes(query) ||
      m.videoId.toLowerCase().includes(query) ||
      (m.movieRelease && m.movieRelease.toLowerCase().includes(query))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "id") {
      return sortAsc ? a.id - b.id : b.id - a.id;
    } else {
      return sortAsc
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
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
      setSelectedIds(paginated.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one movie");
      return;
    }

    if (
      !confirm(
        `Are you sure that you want to remove the selected ${selectedIds.length} movie(s)?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await bulkDeleteMoviesAction(selectedIds);
      if (res.success) {
        setMoviesList((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
        setSelectedIds([]);
      } else {
        alert(res.error || "Failed to delete movies");
      }
    });
  };

  const handleSingleDelete = (id: number) => {
    startTransition(async () => {
      const res = await deleteMovieAction(id);
      if (res.success) {
        setMoviesList((prev) => prev.filter((m) => m.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert(res.error || "Failed to delete movie");
      }
    });
  };

  const toggleSort = (field: "id" | "title") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb matching Screenshot 2 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Movies
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="text-[#04abf2] hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span>Movies</span>
          <span>&gt;</span>
          <span className="text-neutral-700 dark:text-neutral-200 font-semibold">
            Manage Movies
          </span>
        </nav>
      </div>

      {/* Main Card matching Screenshot 2 */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        {/* Card Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
            Manage Movies
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

        {/* Search for Keyword */}
        <div className="p-5 pb-4 space-y-1">
          <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
            Search for Keyword
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-80 max-w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder=""
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

        {/* Table matching Screenshot 2 */}
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
                <th
                  onClick={() => toggleSort("id")}
                  className="py-3 px-4 w-20 border-r border-neutral-200 dark:border-[#292d33] cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {sortField === "id" && (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-neutral-800 dark:text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-800 dark:text-white" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("title")}
                  className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>NAME</span>
                    {sortField === "title" && (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-neutral-800 dark:text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-800 dark:text-white" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  RELEASE
                </th>
                <th className="py-3 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-neutral-500 dark:text-neutral-400 text-xs"
                  >
                    No movies found
                  </td>
                </tr>
              ) : (
                paginated.map((m) => {
                  const isChecked = selectedIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(m.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {m.id}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <Link
                          href={`/watch/${m.videoId}`}
                          target="_blank"
                          className="text-[#04abf2] hover:underline font-medium"
                        >
                          {m.title}
                        </Link>
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] text-neutral-600 dark:text-neutral-400">
                        {m.movieRelease || "N/A"}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/edit-video/${m.id}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(m.id)}
                            className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
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

        {/* Footer / Pagination & Bulk Delete */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#292d33] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing {paginated.length > 0 ? (currentPage - 1) * limitPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * limitPerPage, sorted.length)} of {sorted.length} entries
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

        {/* Bulk Delete Button matching Screenshot */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0 || isPending}
            className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
          >
            {isPending ? "Deleting..." : `Delete Selected ${selectedIds.length > 0 ? `(${selectedIds.length})` : ""}`}
          </button>
        </div>
      </div>

      {/* Delete Single Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full shadow-2xl overflow-hidden p-5 space-y-4">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Movie?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete this movie?
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
