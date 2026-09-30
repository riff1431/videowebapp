"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { deleteVideoAdsAction } from "@/modules/admin/video-ads.actions";

interface VideoAdItem {
  id: number;
  name: string;
  type: string;
  adMedia: string;
  adUrl: string;
  clicks: number;
  views: number;
  duration: number;
  createdAt: string;
}

interface ManageVideoAdsClientProps {
  initialAds: VideoAdItem[];
}

export function ManageVideoAdsClient({ initialAds }: ManageVideoAdsClientProps) {
  const [ads, setAds] = useState<VideoAdItem[]>(initialAds);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = ads.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
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
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected ad(s)?`)) {
      startTransition(async () => {
        await deleteVideoAdsAction(selectedIds);
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
          Manage Video Ads
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Advertisement</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Video Ads</span>
        </nav>
      </div>

      {/* Main Table Card matching Screenshot */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between relative">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage Video Ads
          </h6>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              <span>Create New Ad</span>
              <span className="text-[10px]">▼</span>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href="/admin/create-video-ad?type=video"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-800 dark:text-[#ced4da] hover:bg-neutral-100 dark:hover:bg-[#2c3036] transition-colors"
                  >
                    Video Ad
                  </Link>
                  <Link
                    href="/admin/create-video-ad?type=image"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-800 dark:text-[#ced4da] hover:bg-neutral-100 dark:hover:bg-[#2c3036] transition-colors"
                  >
                    Image Ad
                  </Link>
                  <Link
                    href="/admin/create-video-ad?type=vast"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-neutral-800 dark:text-[#ced4da] hover:bg-neutral-100 dark:hover:bg-[#2c3036] transition-colors"
                  >
                    Vast / Vpaid
                  </Link>
                </div>
              </>
            )}
          </div>
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
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">NAME <span>↓</span></span>
                </th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">CLICKS <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">VIEWS <span>↓</span></span>
                </th>
                <th className="py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-xs text-neutral-400 dark:text-[#8c96a3]">
                    No video ads found
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
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {ad.name}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-neutral-600 dark:text-neutral-300">
                      {ad.type}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-800 dark:text-white font-medium">
                      {ad.clicks}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-800 dark:text-white font-medium">
                      {ad.views}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={ad.adUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded bg-blue-500/10 text-[#04abf2] hover:bg-[#04abf2] hover:text-white transition-colors"
                          title="Open Ad Target"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            if (confirm("Delete this video ad?")) {
                              deleteVideoAdsAction([ad.id]);
                              setAds((prev) => prev.filter((a) => a.id !== ad.id));
                            }
                          }}
                          className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Selected Button matching Screenshot */}
        <div className="p-5 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className={`px-5 py-2 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer ${
              selectedIds.length > 0 ? "bg-[#04abf2] hover:bg-[#0396d5]" : "bg-[#04abf2]/50 cursor-not-allowed"
            }`}
          >
            Delete Selected
          </button>
        </div>
      </div>

    </div>
  );
}
