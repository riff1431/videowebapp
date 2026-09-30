"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { deleteUserAdsAction } from "@/modules/admin/user-ads.actions";

interface UserAdRow {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  website: string;
  title: string;
  wallet: number;
  spent: number;
  published: string;
  placement: string;
  results: number;
}

interface ManageUserAdsClientProps {
  initialAds: UserAdRow[];
}

export function ManageUserAdsClient({ initialAds }: ManageUserAdsClientProps) {
  const [ads, setAds] = useState<UserAdRow[]>(initialAds);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const filtered = ads.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.website.toLowerCase().includes(search.toLowerCase()) ||
    a.userName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} ad(s)?`)) {
      startTransition(async () => {
        await deleteUserAdsAction(selectedIds);
        setAds((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        setSelectedIds([]);
      });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage User Advertisements
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Advertisements</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage User Advertisements</span>
        </nav>
      </div>

      {/* Main Table Card matching Screenshot */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage User Advertisements
          </h6>
          <span className="px-4 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 font-medium">
            All
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-5 pb-3">
          <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1.5 font-medium">
            Search for Keyword
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <button
              onClick={() => {}}
              className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">ID <span>↑</span></span>
                </th>
                <th className="py-3 px-4">WEBSITE</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">TITLE <span>↓</span></span>
                </th>
                <th className="py-3 px-4">USER</th>
                <th className="py-3 px-4">WALLET</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">SPENT <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">PUBLISHED <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">PLACEMENT <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">RESULTS <span>↓</span></span>
                </th>
                <th className="py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-xs text-neutral-400 dark:text-[#8c96a3]">
                    No user advertisements found
                  </td>
                </tr>
              ) : (
                filtered.map((ad) => (
                  <tr key={ad.id} className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors">
                    <td className="py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ad.id)}
                        onChange={() => toggleSelectOne(ad.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                      {ad.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={ad.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#04abf2] hover:underline flex items-center gap-1 max-w-[140px] truncate"
                      >
                        <span className="truncate">{ad.website}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white max-w-[160px] truncate">
                      {ad.title}
                    </td>
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <img
                        src={ad.userAvatar}
                        alt={ad.userName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-neutral-800 dark:text-neutral-200">{ad.userName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                      ${ad.wallet.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800 dark:text-white">
                      ${ad.spent.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      {ad.published}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300 max-w-[140px] truncate">
                      {ad.placement}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800 dark:text-white">
                      {ad.results}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          if (confirm("Delete this user ad?")) {
                            deleteUserAdsAction([ad.id]);
                            setAds((prev) => prev.filter((a) => a.id !== ad.id));
                          }
                        }}
                        className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Selected Button & Footer Pagination */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className={`px-5 py-2 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer ${
              selectedIds.length > 0 ? "bg-[#04abf2] hover:bg-[#0396d5]" : "bg-[#04abf2]/50 cursor-not-allowed"
            }`}
          >
            Delete Selected
          </button>

          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-[#8c96a3]">
            <span>Showing 1 out of 1</span>
            <button className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d] ml-2">
              &lsaquo;
            </button>
            <button className="px-2.5 py-1 rounded bg-[#04abf2] text-white font-semibold">
              1
            </button>
            <button className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d]">
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
