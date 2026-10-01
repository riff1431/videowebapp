"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCopyrightReportsAction,
  deleteCopyrightReportAction,
  bulkDeleteCopyrightReportsAction,
  type CopyrightReportItem,
} from "@/modules/admin/reports.actions";

export default function ManageCopyrightReportsPage() {
  const [reports, setReports] = useState<CopyrightReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("DESC_i");
  const [range, setRange] = useState<string>("All");
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Single Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  // Bulk Delete Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReports = async (
    q = search,
    s = sortField,
    r = range,
    p = page
  ) => {
    setLoading(true);
    try {
      const data = await getCopyrightReportsAction({
        query: q,
        sort: s,
        range: r,
        page: p,
      });
      setReports(data.reports);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(search, sortField, range, page);
  }, [sortField, range, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReports(search, sortField, range, 1);
  };

  const handleSort = (type: "i" | "t") => {
    let nextSort = "DESC_i";
    if (type === "i") {
      nextSort = sortField === "DESC_i" ? "ASC_i" : "DESC_i";
    } else {
      nextSort = sortField === "DESC_t" ? "ASC_t" : "DESC_t";
    }
    setSortField(nextSort);
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reports.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmSingleDelete = async () => {
    if (!reportToDelete) return;
    setActionLoading(true);
    const res = await deleteCopyrightReportAction(reportToDelete);
    setActionLoading(false);
    setDeleteModalOpen(false);
    setReportToDelete(null);
    if (res.success) {
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete));
      setSelectedIds((prev) => prev.filter((i) => i !== reportToDelete));
      setNotice({ type: "success", text: "Copyright report removed!" });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to delete" });
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    const res = await bulkDeleteCopyrightReportsAction(selectedIds);
    setActionLoading(false);
    setBulkModalOpen(false);
    if (res.success) {
      setReports((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setNotice({
        type: "success",
        text: "Selected copyright reports deleted successfully!",
      });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: "error", text: res.error || "Bulk delete failed" });
    }
  };

  const rangesList = [
    "All",
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
  ];

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching 3rd screenshot */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Manage Video Reports
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Reports</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Manage Video Reports</span>
        </nav>
      </div>

      {notice && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-md text-xs font-medium border ${
            notice.type === "success"
              ? "bg-[#18362d] border-[#1d4c3f] text-[#34d399]"
              : "bg-[#361818] border-[#4c1d1d] text-[#f87171]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Main Container Card matching screenshot 3 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage Video Reports
          </h6>

          {/* Daterange dropdown pill matching right corner 'All' button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="px-4 py-1.5 text-xs font-medium border border-neutral-300 dark:border-[#33373d] hover:bg-neutral-100 dark:hover:bg-[#2a2e35] text-neutral-700 dark:text-[#c2c7d0] rounded transition-colors"
            >
              {range}
            </button>
            {rangeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1f2226] border border-neutral-200 dark:border-[#33373d] rounded shadow-lg z-20 py-1 text-xs">
                {rangesList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRange(r);
                      setRangeDropdownOpen(false);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-[#2b2f36] ${
                      range === r
                        ? "text-[#008DD1] font-semibold"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search for Keyword form matching screenshot 3 */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row items-end gap-3 max-w-md">
            <div className="w-full">
              <label className="block text-xs font-normal text-neutral-600 dark:text-[#8c96a3] mb-1.5">
                Search for Keyword
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1a1c20] border border-neutral-300 dark:border-[#2f333a] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="h-9 px-6 bg-[#00adef] hover:bg-[#009bd6] text-white font-medium text-xs rounded transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Copyright Reports Table matching screenshot 3 */}
        <div className="overflow-x-auto border border-neutral-200 dark:border-[#2f333a] rounded">
          <table className="w-full text-left text-xs text-[#212529] dark:text-[#a0abb8]">
            <thead className="bg-neutral-50 dark:bg-[#1a1c20] text-neutral-600 dark:text-[#8c96a3] uppercase font-semibold text-[11px] border-b border-neutral-200 dark:border-[#2f333a]">
              <tr>
                <th className="p-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      reports.length > 0 && selectedIds.length === reports.length
                    }
                    onChange={handleCheckAll}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-[#3e444e] bg-white dark:bg-[#1c1e22] text-[#008DD1] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("i")}
                  className="p-3 w-20 cursor-pointer select-none hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    {sortField === "ASC_i" ? (
                      <span className="text-[10px]">▲</span>
                    ) : (
                      <span className="text-[10px]">▼</span>
                    )}
                  </div>
                </th>
                <th className="p-3">USERNAME</th>
                <th
                  onClick={() => handleSort("t")}
                  className="p-3 cursor-pointer select-none hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>REPORTED</span>
                    {sortField === "ASC_t" ? (
                      <span className="text-[10px]">▲</span>
                    ) : (
                      <span className="text-[10px]">▼</span>
                    )}
                  </div>
                </th>
                <th className="p-3">VIDEO</th>
                <th className="p-3 text-left">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#26292f]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-400">
                    Loading copyright reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-400">
                    No copyright reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <React.Fragment key={report.id}>
                    <tr
                      className={`hover:bg-neutral-50 dark:hover:bg-[#1c1e22] transition-colors ${
                        selectedIds.includes(report.id)
                          ? "bg-neutral-100 dark:bg-[#20242a]"
                          : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(report.id)}
                          onChange={() => handleCheckOne(report.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-[#3e444e] bg-white dark:bg-[#1c1e22] text-[#008DD1] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold text-neutral-800 dark:text-neutral-200">
                        {report.id}
                      </td>
                      <td className="p-3 text-neutral-700 dark:text-[#c2c7d0]">
                        {report.username}
                      </td>
                      <td className="p-3 text-neutral-600 dark:text-[#8c96a3]">
                        {report.time}
                      </td>
                      <td className="p-3">
                        <Link
                          href={report.videoUrl}
                          target="_blank"
                          className="text-[#008DD1] hover:underline max-w-[260px] truncate block"
                        >
                          {report.videoTitle}
                        </Link>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View Button matching cyan/blue button in screenshot 3 */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                expandedId === report.id ? null : report.id
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#00adef] hover:bg-[#009bd6] text-white rounded font-medium transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>
                              {expandedId === report.id ? "Hide" : "View"}
                            </span>
                          </button>

                          {/* Delete Button matching red button */}
                          <button
                            type="button"
                            onClick={() => {
                              setReportToDelete(report.id);
                              setDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#ef4444] hover:bg-[#dc2626] text-white rounded font-medium transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Collapsible View Row showing report details matching view.html */}
                    {expandedId === report.id && (
                      <tr className="bg-neutral-50 dark:bg-[#1a1c20]">
                        <td colSpan={6} className="p-4 border-t border-neutral-200 dark:border-[#292d33]">
                          <div className="max-w-xl bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#2f333a] rounded p-4 shadow-xs">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={report.userAvatar}
                                alt={report.username}
                                className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-[#383d46]"
                              />
                              <div>
                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {report.username}
                                </h4>
                                <span className="text-[11px] text-neutral-400">
                                  {report.time}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded mb-1">
                                Message
                              </span>
                              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                {report.text || "No text provided with this copyright report."}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Showing 1 out of 1 + Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-xs text-neutral-500 dark:text-[#8c96a3]">
          <div>
            Showing {reports.length > 0 ? page : 0} out of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="px-2 py-1 border border-neutral-300 dark:border-[#2f333a] rounded disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
              title="First Page"
            >
              |&lt;
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-neutral-300 dark:border-[#2f333a] rounded disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              &lt;
            </button>
            <span className="px-3 py-1 bg-[#00adef] text-white font-semibold rounded">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-neutral-300 dark:border-[#2f333a] rounded disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              &gt;
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-2 py-1 border border-neutral-300 dark:border-[#2f333a] rounded disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
              title="Last Page"
            >
              &gt;|
            </button>
          </div>
        </div>

        {/* Bottom Button matching screenshot 3: 'Delete Selected' */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            type="button"
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={() => setBulkModalOpen(true)}
            className="h-9 px-6 bg-[#00adef] hover:bg-[#009bd6] disabled:opacity-40 text-white font-medium text-xs rounded transition-colors"
          >
            Delete Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </button>
        </div>
      </div>

      {/* Delete Single Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#2d3238] rounded-lg max-w-sm w-full p-5 shadow-xl">
            <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
              Delete Report?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure that you want to remove this Report?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setReportToDelete(null);
                }}
                className="px-3.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-[#383d46] rounded hover:bg-neutral-100 dark:hover:bg-[#2b2f36]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmSingleDelete}
                className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#2d3238] rounded-lg max-w-sm w-full p-5 shadow-xl">
            <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
              Delete Report?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure that you want to remove the selected {selectedIds.length} Report(s)?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-[#383d46] rounded hover:bg-neutral-100 dark:hover:bg-[#2b2f36]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmBulkDelete}
                className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
