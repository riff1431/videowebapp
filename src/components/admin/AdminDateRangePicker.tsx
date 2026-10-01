"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type DateRangeOption =
  | "All"
  | "Today"
  | "Yesterday"
  | "This Week"
  | "This Month"
  | "Last Month"
  | "This Year"
  | "Custom Range";

interface AdminDateRangePickerProps {
  value: DateRangeOption;
  onChange: (val: DateRangeOption, customDates?: { start: Date; end: Date }) => void;
  className?: string;
}

const OPTIONS: DateRangeOption[] = [
  "All",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Last Month",
  "This Year",
  "Custom Range",
];

export function AdminDateRangePicker({
  value,
  onChange,
  className = "",
}: AdminDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DateRangeOption) => {
    if (option === "Custom Range") {
      setIsOpen(false);
      setShowCustomModal(true);
      return;
    }
    onChange(option);
    setIsOpen(false);
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    const s = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    onChange("Custom Range", { start: s, end });
    setShowCustomModal(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Top Right "All" / Range button matching Screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#181a1d] dark:hover:bg-[#25282e] border border-neutral-300 dark:border-[#2f343b] text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded transition-colors shadow-xs flex items-center justify-center min-w-[70px] cursor-pointer"
      >
        <span>{value}</span>
      </button>

      {/* Dropdown Menu matching Screenshot */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#2f343b] rounded shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
          {OPTIONS.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer block ${
                  isSelected
                    ? "bg-[#04abf2] text-white"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#181a1d]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full shadow-2xl overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Select Custom Range
            </h5>
            <form onSubmit={handleCustomApply} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility to filter an array of items by Date range
export function filterByDateRange<T extends { createdAt?: Date | string | null; time?: Date | string | null }>(
  items: T[],
  range: DateRangeOption,
  customDates?: { start: Date; end: Date }
): T[] {
  if (range === "All") return items;

  const now = new Date();

  return items.filter((item) => {
    const rawDate = item.createdAt || item.time;
    if (!rawDate) return true;
    const itemDate = new Date(rawDate);

    if (range === "Today") {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === "Yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return (
        itemDate.getDate() === yesterday.getDate() &&
        itemDate.getMonth() === yesterday.getMonth() &&
        itemDate.getFullYear() === yesterday.getFullYear()
      );
    }

    if (range === "This Week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return itemDate >= weekAgo && itemDate <= now;
    }

    if (range === "This Month") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === "Last Month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return itemDate >= lastMonth && itemDate <= lastMonthEnd;
    }

    if (range === "This Year") {
      return itemDate.getFullYear() === now.getFullYear();
    }

    if (range === "Custom Range" && customDates) {
      return itemDate >= customDates.start && itemDate <= customDates.end;
    }

    return true;
  });
}
