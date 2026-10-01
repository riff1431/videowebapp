"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateLanguageIsoAction,
  updateLanguageTranslationAction,
} from "@/modules/admin/languages.actions";

export interface TranslationRow {
  id: number;
  key: string;
  value: string;
}

interface EditLangClientProps {
  langName: string;
  initialIso: string;
  initialRows: TranslationRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentQuery: string;
}

export function EditLangClient({
  langName,
  initialIso,
  initialRows,
  totalCount,
  currentPage,
  pageSize,
  currentQuery,
}: EditLangClientProps) {
  const router = useRouter();
  const [iso, setIso] = useState(initialIso);
  const [isoSaved, setIsoSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [rows, setRows] = useState<TranslationRow[]>(initialRows);

  // Modal editing state
  const [editingRow, setEditingRow] = useState<TranslationRow | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [isSavingModal, setIsSavingModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Handle ISO Code blur or enter to save
  const handleSaveIso = async () => {
    if (iso.trim() === initialIso) return;
    const res = await updateLanguageIsoAction(langName, iso);
    if (res.success) {
      setIsoSaved(true);
      setTimeout(() => setIsoSaved(false), 2000);
    }
  };

  // Handle Search keyword
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/admin/edit-lang?id=${encodeURIComponent(langName)}&query=${encodeURIComponent(searchQuery)}&page=1`
    );
  };

  // Open edit modal
  const handleOpenEdit = (row: TranslationRow) => {
    setEditingRow(row);
    setModalValue(row.value);
    setModalFeedback(null);
  };

  // Save changes from modal
  const handleSaveTranslation = async () => {
    if (!editingRow) return;
    setIsSavingModal(true);
    setModalFeedback(null);

    const res = await updateLanguageTranslationAction(
      editingRow.key,
      langName,
      modalValue
    );

    setIsSavingModal(false);
    if (res.success) {
      setRows((prev) =>
        prev.map((r) =>
          r.key === editingRow.key ? { ...r, value: modalValue } : r
        )
      );
      setEditingRow(null);
    } else {
      setModalFeedback(res.error || "Failed to update translation");
    }
  };

  // Pagination navigation helper
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    router.push(
      `/admin/edit-lang?id=${encodeURIComponent(langName)}&query=${encodeURIComponent(searchQuery)}&page=${p}`
    );
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot 1 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage & Edit Languages
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <Link href="/admin/manage-languages" className="hover:underline text-[#008DD1]">
            Languages
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">
            Manage & Edit Languages ({langName})
          </span>
        </nav>
      </div>

      {/* Edit Language ISO Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33]">
          <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
            Edit Language ISO
          </h4>
        </div>
        <div className="p-6">
          <div className="max-w-xl space-y-2">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Language ISO
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                onBlur={handleSaveIso}
                placeholder="e.g. en, ar, es"
                className="w-full max-w-md px-3.5 py-2 text-sm bg-neutral-50 dark:bg-[#1a1d21] border border-neutral-300 dark:border-[#2f343b] rounded text-neutral-900 dark:text-white focus:outline-none focus:border-[#04abf2] transition-colors"
              />
              <button
                type="button"
                onClick={handleSaveIso}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#008dd1] hover:bg-[#007bb8] rounded transition-colors"
              >
                {isoSaved ? "Saved!" : "Save ISO"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manage & Edit Languages Table Card matching Screenshot 1 & 2 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33]">
          <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
            Manage & Edit Languages
          </h4>
        </div>

        {/* Search for Keyword */}
        <div className="p-6 pb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                Search for Keyword
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type keyword or phrase..."
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-[#1a1d21] border border-neutral-300 dark:border-[#2f343b] rounded text-neutral-900 dark:text-white focus:outline-none focus:border-[#04abf2] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#00b0ff] hover:bg-[#009ee6] rounded shadow-xs transition-colors cursor-pointer"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  router.push(`/admin/edit-lang?id=${encodeURIComponent(langName)}&page=1`);
                }}
                className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-neutral-200 dark:border-[#292d33] bg-neutral-50/50 dark:bg-[#1f2226] text-neutral-500 dark:text-[#9a9cab] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5 w-16">ID</th>
                <th className="py-3 px-6">KEY NAME</th>
                <th className="py-3 px-6">VALUE</th>
                <th className="py-3 px-6 text-center w-28">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-500">
                    No translation keys found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.key}
                    className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2226] transition-colors"
                  >
                    <td className="py-3.5 px-5 text-neutral-500 dark:text-neutral-400">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-neutral-700 dark:text-[#ced4da]">
                      {row.key}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-900 dark:text-neutral-200 max-w-md break-words">
                      {row.value}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#2c3036] dark:hover:bg-[#343940] text-neutral-700 dark:text-[#ced4da] rounded text-[11px] font-semibold tracking-wider transition-colors cursor-pointer"
                      >
                        EDIT
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Screenshot 2 */}
        <div className="p-5 border-t border-neutral-200 dark:border-[#292d33] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            Showing {currentPage} out of {totalPages} ({totalCount} total keys)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(1)}
              className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2f343b] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              |&lt;
            </button>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2f343b] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              &lt;
            </button>

            {/* Current page indicator pill matching screenshot */}
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#008dd1] text-white font-bold text-xs shadow-xs">
              {currentPage}
            </span>

            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-[#2a2e35] text-neutral-600 dark:text-neutral-300 font-medium"
              >
                {currentPage + 1}
              </button>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2f343b] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              &gt;
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(totalPages)}
              className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2f343b] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-[#2a2e35]"
            >
              &gt;|
            </button>
          </div>
        </div>
      </div>

      {/* Edit Key Modal Dialog */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#2f343b] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#292d33]">
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                Edit Keyword:{" "}
                <span className="font-mono text-sm text-[#008dd1]">
                  {editingRow.key}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalFeedback && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded">
                  {modalFeedback}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  {editingRow.key} ({langName})
                </label>
                <textarea
                  rows={4}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full p-3 text-sm bg-neutral-50 dark:bg-[#1a1d21] border border-neutral-300 dark:border-[#2f343b] rounded text-neutral-900 dark:text-white focus:outline-none focus:border-[#04abf2] resize-y"
                  placeholder="Enter translation value..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 dark:bg-[#1d2024] border-t border-neutral-200 dark:border-[#292d33]">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2c3036] rounded transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSavingModal}
                onClick={handleSaveTranslation}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#008dd1] hover:bg-[#007bb8] rounded transition-colors disabled:opacity-50"
              >
                {isSavingModal ? "Please wait..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
