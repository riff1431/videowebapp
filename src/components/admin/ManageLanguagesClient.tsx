"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Edit2, Square } from "lucide-react";
import {
  toggleLanguageStatusAction,
  deleteLanguagesAction,
} from "@/modules/admin/languages.actions";

export interface LanguageItem {
  id: number;
  name: string;
  iso: string;
  status: string; // "active" | "disabled"
}

interface ManageLanguagesClientProps {
  initialLanguages: LanguageItem[];
}

export function ManageLanguagesClient({ initialLanguages }: ManageLanguagesClientProps) {
  const [languages, setLanguages] = useState<LanguageItem[]>(initialLanguages);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const toggleSelectAll = () => {
    if (selectedIds.length === languages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(languages.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    startTransition(async () => {
      const res = await toggleLanguageStatusAction(id, currentStatus);
      if (res.success && res.newStatus) {
        setLanguages((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: res.newStatus } : l))
        );
      }
    });
  };

  const handleDeleteOne = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      startTransition(async () => {
        const res = await deleteLanguagesAction([id]);
        if (res.success) {
          setLanguages((prev) => prev.filter((l) => l.id !== id));
          setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected language(s)?`)) {
      startTransition(async () => {
        const res = await deleteLanguagesAction(selectedIds);
        if (res.success) {
          setLanguages((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
          setSelectedIds([]);
        }
      });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot 3 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Languages
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Languages</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Languages</span>
        </nav>
      </div>

      {/* Main Table Card matching Screenshot 3 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage & Edit Languages
          </h6>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === languages.length && languages.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-6 font-semibold border-r border-neutral-200 dark:border-[#292d33]">
                  LANGUAGE NAME
                </th>
                <th className="py-3 px-6 text-center font-semibold w-64">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {languages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No languages found.
                  </td>
                </tr>
              ) : (
                languages.map((lang) => {
                  const isSelected = selectedIds.includes(lang.id);
                  const isRowActive = lang.status === "active";
                  return (
                    <tr
                      key={lang.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2226] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(lang.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-6 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {lang.name}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {/* Edit button */}
                          <Link
                            href={`/admin/edit-lang?id=${encodeURIComponent(lang.name)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span className="text-[10px]">🖊</span>
                            <span>Edit</span>
                          </Link>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOne(lang.id, lang.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span className="text-[9px]">■</span>
                            <span>Delete</span>
                          </button>

                          {/* Disable / Enable button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(lang.id, lang.status)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span>{isRowActive ? "Disable" : "Enable"}</span>
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
      </div>

      {/* Delete Selected Button matching bottom left in Screenshot 3 */}
      <div>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className="px-5 py-2 bg-[#4cc3f5] hover:bg-[#39b6ea] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
}
