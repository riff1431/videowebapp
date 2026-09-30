"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface EarningsClientProps {
  stats: {
    totalWithComm: number;
    totalWithoutComm: number;
    totalCommission: number;
    todayEarnings: number;
    monthEarnings: number;
    yearEarnings: number;
  };
}

export function EarningsClient({ stats }: EarningsClientProps) {
  const [filterPeriod, setFilterPeriod] = useState("Today");

  // Chart data matching PlayTube hour intervals (00 AM through 11 PM)
  const chartData = [
    { time: "00 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "1 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "2 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "3 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "4 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "5 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "6 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "7 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "8 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "9 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "10 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "11 AM", videos: 0, subscribe: 0, ads: 0 },
    { time: "12 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "1 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "2 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "3 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "4 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "5 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "6 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "7 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "8 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "9 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "10 PM", videos: 0, subscribe: 0, ads: 0 },
    { time: "11 PM", videos: 0, subscribe: 0, ads: 0 },
  ];

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Earnings
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Earnings</span>
        </nav>
      </div>

      {/* Row 1: 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL Earnings With Commission */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Earnings With Commission
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-[#04abf2] flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.totalWithComm.toFixed(3)}
            </span>
          </div>
        </div>

        {/* TOTAL Earnings Without Commission */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Earnings Without Commission
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.totalWithoutComm.toFixed(3)}
            </span>
          </div>
        </div>

        {/* TOTAL Commission */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Commission
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.totalCommission.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL Earnings Today */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Earnings Today
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-500 flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.todayEarnings.toFixed(3)}
            </span>
          </div>
        </div>

        {/* TOTAL Earnings This Month */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Earnings This Month
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-500 flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.monthEarnings.toFixed(3)}
            </span>
          </div>
        </div>

        {/* TOTAL Earnings This Year */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            TOTAL Earnings This Year
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950/50 text-pink-500 flex items-center justify-center font-bold text-base">
              $
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.yearEarnings.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Users Statics Chart Card matching Screenshots 1 & 2 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
        <h6 className="text-[13px] font-bold text-neutral-800 dark:text-white uppercase tracking-wider mb-5">
          USERS STATICS
        </h6>

        <div className="mb-6 max-w-xs">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2]"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>

        {/* Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#181a1d",
                  borderColor: "#2f343b",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="videos"
                stroke="#5cb85c"
                strokeWidth={2}
                dot={false}
                name="Videos Earnings"
              />
              <Line
                type="monotone"
                dataKey="subscribe"
                stroke="#d9534f"
                strokeWidth={2}
                dot={false}
                name="Subscribe Earnings"
              />
              <Line
                type="monotone"
                dataKey="ads"
                stroke="#f0ad4e"
                strokeWidth={2}
                dot={false}
                name="Ads Earnings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend matching Screenshot 2 */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#5cb85c]" />
            <span>Videos Earnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#d9534f]" />
            <span>Subscribe Earnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#f0ad4e]" />
            <span>Ads Earnings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
