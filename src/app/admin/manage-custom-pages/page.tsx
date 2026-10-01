"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCustomPagesAction,
  deleteCustomPageAction,
  deleteMultipleCustomPagesAction,
  type CustomPageItem,
} from "@/modules/admin/pages.actions";

export default function ManageCustomPages() {
  const [pages, setPages] = useState<CustomPageItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>("DESC_i");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);
  const [deleteMultipleModalOpen, setDeleteMultipleModalOpen] = useState(false);

  const fetchPages = async (query = search, sort = sortField) => {
    setLoading(true);
    try {
      const data = await getCustomPagesAction(query, sort);
      setPages(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages(search, sortField);
  };

  const handleSort = (field: "id" | "name" | "title") => {
    let nextSort = "DESC_i";
    if (field === "id") {
      nextSort = sortField === "DESC_i" ? "ASC_i" : "DESC_i";
    } else if (field === "name") {
      nextSort = sortField === "DESC_n" ? "ASC_n" : "DESC_n";
    } else if (field === "title") {
      nextSort = sortField === "DESC_t" ? "ASC_t" : "DESC_t";
    }
    setSortField(nextSort);
    fetchPages(search, nextSort);
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(pages.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const confirmDeleteSingle = async () => {
    if (!pageToDelete) return;
    const res = await deleteCustomPageAction(pageToDelete);
    setDeleteModalOpen(false);
    setPageToDelete(null);
    if (res.success) {
      setNotice({ type: "success", text: "Page deleted successfully!" });
      fetchPages(search, sortField);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to delete page" });
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const confirmDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    const res = await deleteMultipleCustomPagesAction(selectedIds);
    setDeleteMultipleModalOpen(false);
    setSelectedIds([]);
    if (res.success) {
      setNotice({ type: "success", text: "Selected pages deleted successfully!" });
      fetchPages(search, sortField);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to delete pages" });
    }
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching design/pages/manage-custom-pages/1.png */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Manage Custom Pages
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Pages</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Manage Custom Pages</span>
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

      {/* Main Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
        {/* Card Header with Create Button on the right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage &amp; Edit Custom Pages
          </h6>
          <Link
            href="/admin/add-new-custom-page"
            className="px-4 py-2 bg-[#008DD1] hover:bg-[#007cb8] text-white font-medium text-xs rounded transition-colors shadow-xs"
          >
            Create New Custom Page
          </Link>
        </div>

        {/* Search for Keyword */}
        <form onSubmit={handleSearchSubmit} className="mb-6 max-w-lg">
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            Search for Keyword
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by page name, title, or content..."
              className="flex-1 h-9 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white"
            />
            <button
              type="submit"
              className="h-9 px-5 bg-[#008DD1] hover:bg-[#007cb8] text-white text-xs font-medium rounded transition-colors shadow-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="overflow-x-auto border-t border-neutral-200 dark:border-[#292d33]">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-[#292d33]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={pages.length > 0 && selectedIds.length === pages.length}
                    onChange={handleCheckAll}
                    className="rounded accent-[#008DD1] cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("id")}
                  className="py-3 px-3 w-20 cursor-pointer select-none font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <span className="flex items-center gap-1">
                    ID
                    <span className="text-[10px]">
                      {sortField === "ASC_i" ? "↑" : "↓"}
                    </span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3 cursor-pointer select-none font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <span className="flex items-center gap-1">
                    PAGE NAME
                    <span className="text-[10px]">
                      {sortField === "ASC_n" ? "↑" : "↓"}
                    </span>
                  </span>
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className="py-3 px-3 cursor-pointer select-none font-semibold text-neutral-800 dark:text-neutral-200"
                >
                  <span className="flex items-center gap-1">
                    PAGE TITLE
                    <span className="text-[10px]">
                      {sortField === "ASC_t" ? "↑" : "↓"}
                    </span>
                  </span>
                </th>
                <th className="py-3 px-3 w-44 font-semibold text-neutral-800 dark:text-neutral-200">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Loading pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No custom pages found.
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-neutral-50 dark:hover:bg-[#1e2025] transition-colors"
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(page.id)}
                        onChange={() => handleCheckOne(page.id)}
                        className="rounded accent-[#008DD1] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-400">
                      {page.id}
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/site-pages/${page.pageName}`}
                        target="_blank"
                        className="text-[#008DD1] hover:underline font-medium"
                      >
                        {page.pageName}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-neutral-800 dark:text-neutral-200">
                      {page.pageTitle}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/edit-custom-page?id=${page.pageName}`}
                          className="px-2.5 py-1 bg-[#28a745] hover:bg-[#218838] text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setPageToDelete(page.id);
                            setDeleteModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Selected Button */}
        <div className="mt-4">
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteMultipleModalOpen(true)}
            className="px-4 py-2 bg-[#008DD1] hover:bg-[#007cb8] disabled:opacity-40 disabled:hover:bg-[#008DD1] text-white text-xs font-medium rounded transition-colors shadow-xs cursor-pointer"
          >
            Delete Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Delete Single Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full p-5 shadow-xl">
            <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Delete Page?</h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure you want to remove this Page?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white rounded text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingle}
                className="px-3 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Multiple Modal */}
      {deleteMultipleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full p-5 shadow-xl">
            <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Delete Selected Pages?</h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure that you want to remove the selected {selectedIds.length} Page(s)?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteMultipleModalOpen(false)}
                className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white rounded text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmDeleteMultiple}
                className="px-3 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white rounded text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
