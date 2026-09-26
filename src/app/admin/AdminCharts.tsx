"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface AdminDashboardChartsProps {
  usersCount?: number;
  videosCount?: number;
  commentsCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  savedCount?: number;
  viewsCount?: number;
  subsCount?: number;
}

const RANGES = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Last Month",
  "This Year",
];

export function AdminHeaderFilter() {
  const [selectedRange, setSelectedRange] = useState("This Year");
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Full-width Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text-main)]">
          Welcome back, admin
        </h1>

        {/* Date Range Selector matching PlayTube */}
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md bg-[var(--admin-card-bg)] text-[var(--admin-text-main)] border border-[var(--admin-card-border)] hover:bg-[var(--admin-card-hover)] transition-colors shadow-xs cursor-pointer"
          >
            <span>{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
          </button>

          {rangeDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-md bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] shadow-xl py-1 z-30 text-xs">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRange(r);
                    setRangeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 transition-colors cursor-pointer ${
                    selectedRange === r
                      ? "text-[#04abf2] font-semibold bg-[var(--admin-bg)]"
                      : "text-[var(--admin-text-main)] hover:bg-[var(--admin-card-hover)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-width Alert Banner */}
      <div className="w-full bg-[var(--admin-alert-bg)] border border-[var(--admin-alert-border)] text-[#fca5a5] px-4 py-3 rounded-md text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white">Important!</span>
          <span className="text-neutral-200">
            There are some errors found on your system, please review System Status.
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminSideCharts({
  usersCount = 1,
  videosCount = 0,
}: {
  usersCount?: number;
  videosCount?: number;
}) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = months.map((m, i) => ({
    label: m,
    users: i === 8 ? usersCount : 0, // Sep
    posts: 0,
    videos: i === 8 ? videosCount : 0,
  }));

  return (
    <div className="flex flex-col gap-6 h-full justify-between">
      {/* Chart 1: Users Chart (Top-left) */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs flex-1 flex flex-col justify-between">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[var(--admin-text-main)] tracking-tight">
            Dashboard
          </h3>
          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">Users Chart</p>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3136" vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} domain={[0, 5]} allowDecimals={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--admin-card-bg)",
                  borderColor: "var(--admin-card-border)",
                  color: "var(--admin-text-main)",
                  fontSize: "12px",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="#4361ee"
                strokeWidth={2}
                dot={{ fill: "#4361ee", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Videos, Posts Chart */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs flex-1 flex flex-col justify-between">
        <div className="mb-2">
          <p className="text-xs text-[var(--admin-text-muted)]">Videos , Posts Chart</p>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3136" vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} domain={[-1.0, 1.0]} ticks={[-1.0, -0.5, 0, 0.5, 1.0]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--admin-card-bg)",
                  borderColor: "var(--admin-card-border)",
                  color: "var(--admin-text-main)",
                  fontSize: "12px",
                  borderRadius: "6px",
                }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="posts"
                name="Posts"
                stroke="#5c6ac4"
                strokeWidth={2}
                dot={{ fill: "#5c6ac4", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="videos"
                name="Videos"
                stroke="#2a9d8f"
                strokeWidth={2}
                dot={{ fill: "#2a9d8f", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function CommentsLikesDislikesChart() {
  const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = defaultMonths.map((m) => ({
    label: m,
    comments: 0,
    likes: 0,
    dislikes: 0,
  }));

  return (
    <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs w-full">
      <div className="mb-2">
        <p className="text-xs text-[var(--admin-text-muted)]">
          Comments , Likes , Dislikes Chart
        </p>
      </div>
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c3136" vertical={false} />
            <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={11} domain={[-1.0, 1.0]} ticks={[-1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0]} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--admin-card-bg)",
                borderColor: "var(--admin-card-border)",
                color: "var(--admin-text-main)",
                fontSize: "12px",
                borderRadius: "6px",
              }}
            />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="comments"
              name="comments"
              stroke="#b59410"
              strokeWidth={2}
              dot={{ fill: "#b59410", r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="likes"
              name="Likes"
              stroke="#3a86ff"
              strokeWidth={2}
              dot={{ fill: "#3a86ff", r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="dislikes"
              name="Dislikes"
              stroke="#e63946"
              strokeWidth={2}
              dot={{ fill: "#e63946", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
