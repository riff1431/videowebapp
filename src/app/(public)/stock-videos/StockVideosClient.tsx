"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Video, VideoOff, Search, Minus, Plus } from "lucide-react";
import { VideoCard } from "@/components/common/VideoCard";

export interface StockVideoItem {
  id: number;
  videoId: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  duration?: string | null;
  views?: number | null;
  price?: number | null;
  license?: string | null;
  quality?: string | null;
  createdAt: Date;
  user: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
}

interface StockVideosClientProps {
  initialVideos: StockVideoItem[];
}

const LICENSE_TYPES = [
  "License Type",
  "Rights Managed (RM) License",
  "Editorial Use License",
  "Royalty Free License (RF)",
  "Royalty Free Extended License",
  "Creative Commons License",
  "Public Domain",
];

export function StockVideosClient({ initialVideos }: StockVideosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const [minPrice, setMinPrice] = useState(searchParams?.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("max_price") || "");
  const [licenseType, setLicenseType] = useState(searchParams?.get("license") || "License Type");

  // Local active filters for immediate instant feedback
  const [appliedKeyword, setAppliedKeyword] = useState(searchParams?.get("keyword") || "");
  const [appliedMin, setAppliedMin] = useState(searchParams?.get("min_price") || "");
  const [appliedMax, setAppliedMax] = useState(searchParams?.get("max_price") || "");
  const [appliedLicense, setAppliedLicense] = useState(searchParams?.get("license") || "License Type");

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedKeyword(keyword);
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setAppliedLicense(licenseType);

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (minPrice.trim()) params.set("min_price", minPrice.trim());
    if (maxPrice.trim()) params.set("max_price", maxPrice.trim());
    if (licenseType && licenseType !== "License Type") params.set("license", licenseType);

    const queryStr = params.toString();
    router.push(queryStr ? `/stock-videos?${queryStr}` : "/stock-videos");
  };

  const handleMinStep = (delta: number) => {
    const current = parseFloat(minPrice) || 0;
    const next = Math.max(0, current + delta);
    setMinPrice(next === 0 && delta < 0 ? "" : String(next));
  };

  const handleMaxStep = (delta: number) => {
    const current = parseFloat(maxPrice) || 0;
    const next = Math.max(0, current + delta);
    setMaxPrice(next === 0 && delta < 0 ? "" : String(next));
  };

  // Filter video list based on applied search & price/license criteria
  const filteredVideos = initialVideos.filter((video) => {
    if (appliedKeyword.trim()) {
      const q = appliedKeyword.toLowerCase().trim();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = (video.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    const price = video.price || 0;
    if (appliedMin.trim()) {
      const min = parseFloat(appliedMin);
      if (!isNaN(min) && price < min) return false;
    }

    if (appliedMax.trim()) {
      const max = parseFloat(appliedMax);
      if (!isNaN(max) && price > max) return false;
    }

    if (appliedLicense && appliedLicense !== "License Type") {
      const vLic = video.license || "Royalty Free License (RF)";
      if (vLic.toLowerCase() !== appliedLicense.toLowerCase()) return false;
    }

    return true;
  });

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle Icon */}
      <div className="flex items-center gap-2.5 pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
          <Video className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Stock Videos
        </h1>
      </div>

      {/* Decorative Search & Filter Banner Card (1:1 Screenshot Parity) */}
      <div className="relative overflow-hidden bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 mb-10 shadow-xs">
        {/* Subtle Decorative Curves on Left and Right (matching screenshot waves) */}
        <div className="pointer-events-none absolute -left-6 -bottom-6 w-48 h-32 opacity-25 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 200 120" fill="none" className="w-full h-full text-[#9c27b0]">
            <path
              d="M-20 80 C 40 10, 100 110, 180 40 C 220 5, 260 90, 300 20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M-20 90 C 40 20, 100 120, 180 50 C 220 15, 260 100, 300 30"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M-20 100 C 40 30, 100 130, 180 60 C 220 25, 260 110, 300 40"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute -right-6 -bottom-6 w-48 h-32 opacity-25 dark:opacity-10 overflow-hidden">
          <svg viewBox="0 0 200 120" fill="none" className="w-full h-full text-[#04abf2]">
            <path
              d="M-20 80 C 40 10, 100 110, 180 40 C 220 5, 260 90, 300 20"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M-20 90 C 40 20, 100 120, 180 50 C 220 15, 260 100, 300 30"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M-20 100 C 40 30, 100 130, 180 60 C 220 25, 260 110, 300 40"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative z-10 space-y-4">
          {/* Row 1: Search Input & Blue Search Button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white dark:bg-[#141414] border border-neutral-300/80 dark:border-neutral-700 rounded-md px-3.5 py-2 transition-colors focus-within:border-[#04abf2]">
              <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="What you would like to watch?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 outline-none placeholder:text-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="px-7 sm:px-9 py-2.5 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs sm:text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

          {/* Row 2: Min Price Stepper, Max Price Stepper, License Type Select */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Min Price Stepper */}
            <div className="flex items-center border border-neutral-300/80 dark:border-neutral-700 rounded-md bg-white dark:bg-[#141414] overflow-hidden h-9">
              <button
                type="button"
                onClick={() => handleMinStep(-5)}
                className="px-3 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 text-center text-xs text-neutral-800 dark:text-neutral-100 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => handleMinStep(5)}
                className="px-3 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Max Price Stepper */}
            <div className="flex items-center border border-neutral-300/80 dark:border-neutral-700 rounded-md bg-white dark:bg-[#141414] overflow-hidden h-9">
              <button
                type="button"
                onClick={() => handleMaxStep(-5)}
                className="px-3 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 text-center text-xs text-neutral-800 dark:text-neutral-100 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => handleMaxStep(5)}
                className="px-3 h-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* License Type Select Dropdown (Screenshot Parity) */}
            <div className="flex-1 min-w-[220px]">
              <select
                value={licenseType}
                onChange={(e) => {
                  setLicenseType(e.target.value);
                  setAppliedLicense(e.target.value);
                }}
                className="w-full h-9 px-3 text-xs border border-neutral-300/80 dark:border-neutral-700 rounded-md bg-white dark:bg-[#141414] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#04abf2] cursor-pointer"
              >
                {LICENSE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Empty State matching PlayTube Screenshot */}
      {filteredVideos.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No videos found for now!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              views={video.views}
              createdAt={video.createdAt}
              user={video.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
