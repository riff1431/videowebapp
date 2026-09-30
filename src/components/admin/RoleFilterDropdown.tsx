"use client";

import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Shield, Users, Crown } from "lucide-react";

interface RoleFilterDropdownProps {
  value: string; // "admin" | "all" | "pro"
  onChange: (val: string) => void;
  title?: string;
}

/**
 * Filter dropdown button matching PlayTube's .user_filter_drop
 * Lets admin choose who can use the feature (Admin, All Users, Pro Users Only)
 */
export function RoleFilterDropdown({
  value,
  onChange,
  title = "Who can use this feature?",
}: RoleFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block ml-2 align-middle" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Who can use this feature?"
        className="inline-flex items-center justify-center w-7 h-7 rounded bg-neutral-100 dark:bg-[#2a2d33] hover:bg-neutral-200 dark:hover:bg-[#343840] text-neutral-600 dark:text-[#a0a8b4] hover:text-neutral-900 dark:hover:text-white transition-colors border border-neutral-300 dark:border-[#383d46]"
      >
        {/* SVG slider icon identical to PlayTube */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#2e333b] rounded-lg shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-[11px] font-bold text-neutral-800 dark:text-gray-300 mb-2">{title}</p>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onChange("admin");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                value === "admin"
                  ? "bg-[#16a085]/20 text-[#16a085] font-semibold"
                  : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-[#282c34]"
              }`}
            >
              <Shield className="w-4 h-4 text-[#04abf2]" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                value === "all"
                  ? "bg-[#16a085]/20 text-[#16a085] font-semibold"
                  : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-[#282c34]"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>All Users</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onChange("pro");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                value === "pro"
                  ? "bg-[#16a085]/20 text-[#16a085] font-semibold"
                  : "text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-[#282c34]"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Pro Users Only</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
