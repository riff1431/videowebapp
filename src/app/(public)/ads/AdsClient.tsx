"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Wallet as WalletIcon,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { UserAd } from "@/modules/ads/ads.actions";

interface AdsClientProps {
  wallet: number;
  balance: number;
  ads: UserAd[];
}

export function AdsClient({ wallet, balance, ads }: AdsClientProps) {
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAds = ads.filter(
    (ad) =>
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-full mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-neutral-100 dark:border-neutral-800 p-8 sm:p-10 space-y-6">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#04abf2] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              Advertising
            </h1>
          </div>

          <Link
            href="/ads/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create ad</span>
          </Link>
        </div>

        {/* Brownish separator banner per screenshot */}
        <div className="h-1.5 w-full bg-[#8b7961]/40 rounded-full" />

        {/* Explanatory notes */}
        <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
          <p>Your balance shows your earned money from PlayTube.</p>
          <p>Your wallet shows your topup to PlayTube.</p>
          <p>Your wallet money is not withdrawable.</p>
        </div>

        {/* Balance & Wallet Cards (Both click through to /wallet per request) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Wallet Button */}
          <Link
            href="/wallet"
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-[#04abf2] transition-colors flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#04abf2] flex items-center justify-center">
                <WalletIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-[#04abf2] transition-colors">
                Wallet
              </span>
            </div>
            <span className="text-2xl font-bold text-neutral-800 dark:text-white">
              ${wallet.toFixed(2)}
            </span>
          </Link>

          {/* Available Balance Button */}
          <Link
            href="/wallet"
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-emerald-500 transition-colors flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-emerald-500 transition-colors">
                Available balance
              </span>
            </div>
            <span className="text-2xl font-bold text-neutral-800 dark:text-white">
              ${balance.toFixed(2)}
            </span>
          </Link>
        </div>

        {/* Ads Data Table Controls */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <span>Search:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs focus:outline-none focus:border-[#04abf2]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border-t border-neutral-200 dark:border-neutral-800 pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Results</th>
                <th className="py-3 px-4">Spent</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.length > 0 ? (
                filteredAds.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <td className="py-3.5 px-4 font-medium text-emerald-600">{ad.status}</td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">{ad.category}</td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-neutral-200">{ad.name}</td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">{ad.results}</td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">${ad.spent.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#04abf2] hover:underline cursor-pointer">Edit</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-neutral-500 font-normal">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-neutral-500">
          <span>
            Showing {filteredAds.length > 0 ? "1" : "0"} to {filteredAds.length} of {filteredAds.length} entries
          </span>
          {filteredAds.length > 10 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500">1 of 1</span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
