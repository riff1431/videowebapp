"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export interface PopularChannelsHeroProps {
  initialType?: string;
  initialTime?: string;
}

const TYPE_OPTIONS = [
  { value: "views", label: "Views" },
  { value: "subscribers", label: "Subscribers" },
  { value: "active", label: "Most active" },
];

const TIME_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "this_year", label: "This year" },
  { value: "all_time", label: "All time" },
];

export function PopularChannelsHero({
  initialType = "views",
  initialTime = "all_time",
}: PopularChannelsHeroProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [openMenu, setOpenMenu] = useState<"type" | "time" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    setSelectedTime(initialTime);
  }, [initialTime]);

  // Click outside to close open dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    setOpenMenu(null);
    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedTime) params.set("time", selectedTime);
    router.push(`/popular-channels?${params.toString()}`);
  };

  const currentTypeLabel =
    TYPE_OPTIONS.find((o) => o.value === selectedType)?.label || "Views";
  const currentTimeLabel =
    selectedTime === "all_time"
      ? "All Time"
      : TIME_OPTIONS.find((o) => o.value === selectedTime)?.label || "All Time";

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto rounded-2xl bg-[#826afb] text-white shadow-sm py-10 sm:py-14 px-4 sm:px-8 select-none mb-10"
    >
      {/* Diagonal capsule pills pattern background (strictly contained within inner overflow-hidden layer) */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none select-none">
        <div className="absolute -top-10 left-[4%] w-72 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute top-4 left-[22%] w-96 h-9 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute -top-8 right-[16%] w-80 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute top-28 -left-12 w-64 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute top-1/2 left-[28%] w-[420px] h-9 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute top-16 right-[26%] w-80 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute -bottom-10 right-[8%] w-96 h-9 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute bottom-4 left-[10%] w-80 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute -bottom-8 left-[50%] w-72 h-8 rounded-full bg-white/12 -rotate-[35deg]" />
        <div className="absolute top-36 right-[4%] w-60 h-7 rounded-full bg-white/12 -rotate-[35deg]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Flame icon with heart */}
        <div className="w-12 h-12 flex items-center justify-center mb-2.5">
          <svg
            viewBox="0 0 36 36"
            className="w-10 h-10 drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="popFlameGrad"
                x1="18"
                y1="3"
                x2="18"
                y2="33"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ffca28" />
                <stop offset="0.6" stopColor="#ffa000" />
                <stop offset="1" stopColor="#ff5722" />
              </linearGradient>
            </defs>
            {/* Outer flame */}
            <path
              d="M18 3C18 3 12.5 9 12.5 16C12.5 19.5 14 22.2 16.2 23.8C15.5 21 16.8 18.2 18.5 16.5C19.2 19.8 21.8 21.8 21.8 24.8C21.8 25.5 21.6 26.1 21.3 26.7C24 24.5 25.5 21.2 25.5 17.8C25.5 9.8 18 3 18 3Z"
              fill="url(#popFlameGrad)"
            />
            <path
              d="M18 5.5C18 5.5 9.5 13.5 9.5 22.5C9.5 29 13.3 33.5 18 33.5C22.7 33.5 26.5 29 26.5 22.5C26.5 15.5 20.5 11 18 5.5Z"
              fill="url(#popFlameGrad)"
            />
            {/* Red heart in center */}
            <path
              d="M18 26.2L17.15 25.42C13.8 22.38 11.6 20.39 11.6 17.9C11.6 15.86 13.2 14.25 15.25 14.25C16.4 14.25 17.52 14.78 18 15.62C18.48 14.78 19.6 14.25 20.75 14.25C22.8 14.25 24.4 15.86 24.4 17.9C24.4 20.39 22.2 22.38 18.85 25.42L18 26.2Z"
              fill="#e91e63"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase mb-5">
          POPULAR CHANNELS
        </h1>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-white/95 mr-0.5">Filter By</span>

          {/* Metric Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "type" ? null : "type")}
              className="flex items-center justify-between gap-3 px-3.5 py-1.5 min-w-[130px] rounded-[6px] bg-white/25 hover:bg-white/30 text-white text-sm font-normal backdrop-blur-xs transition-colors cursor-pointer select-none border border-white/10"
            >
              <span className="truncate">{currentTypeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
            </button>

            {openMenu === "type" && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[130px] bg-white rounded-md shadow-2xl border border-neutral-100 py-1 z-50 overflow-hidden text-left">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = selectedType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(opt.value);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs sm:text-sm transition-colors cursor-pointer block ${
                        isSelected
                          ? "bg-[#04abf2] text-white font-medium"
                          : "text-neutral-800 hover:bg-neutral-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "time" ? null : "time")}
              className="flex items-center justify-between gap-3 px-3.5 py-1.5 min-w-[130px] rounded-[6px] bg-white/25 hover:bg-white/30 text-white text-sm font-normal backdrop-blur-xs transition-colors cursor-pointer select-none border border-white/10"
            >
              <span className="truncate">{currentTimeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
            </button>

            {openMenu === "time" && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[130px] bg-white rounded-md shadow-2xl border border-neutral-100 py-1 z-50 overflow-hidden text-left">
                {TIME_OPTIONS.map((opt) => {
                  const isSelected = selectedTime === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedTime(opt.value);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs sm:text-sm transition-colors cursor-pointer block ${
                        isSelected
                          ? "bg-[#04abf2] text-white font-medium"
                          : "text-neutral-800 hover:bg-neutral-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-1.5 bg-white hover:bg-neutral-50 text-[#826afb] text-sm font-medium rounded-[6px] shadow-xs transition-all cursor-pointer select-none active:scale-95"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
