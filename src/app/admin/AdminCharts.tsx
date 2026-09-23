"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const MONTHLY_USERS = [
  { month: "Jan", users: 0 },
  { month: "Feb", users: 0 },
  { month: "Mar", users: 0 },
  { month: "Apr", users: 0 },
  { month: "May", users: 0 },
  { month: "Jun", users: 0 },
  { month: "Jul", users: 0 },
  { month: "Aug", users: 0 },
  { month: "Sep", users: 1 },
  { month: "Oct", users: 0 },
  { month: "Nov", users: 0 },
  { month: "Dec", users: 0 },
];

const CONTENT_STATS = [
  { time: "00:00", posts: 0, videos: 0 },
  { time: "04:00", posts: 0, videos: 0 },
  { time: "08:00", posts: 0, videos: 0 },
  { time: "12:00", posts: 0, videos: 0 },
  { time: "16:00", posts: 0, videos: 0 },
  { time: "20:00", posts: 0, videos: 0 },
];

export function AdminCharts() {
  return (
    <div className="space-y-6">
      {/* Users Chart */}
      <div className="bg-[#212529] border border-[#2c3136] rounded-lg p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Dashboard</h3>
          <p className="text-xs text-neutral-400">Users Chart</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_USERS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3136" />
              <XAxis dataKey="month" stroke="#718096" fontSize={11} />
              <YAxis stroke="#718096" fontSize={11} domain={[0, 5]} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1e22",
                  borderColor: "#2c3136",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#04abf2"
                strokeWidth={2}
                dot={{ fill: "#04abf2", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Videos, Posts Chart */}
      <div className="bg-[#212529] border border-[#2c3136] rounded-lg p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">Videos , Posts Chart</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CONTENT_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3136" />
              <XAxis dataKey="time" stroke="#718096" fontSize={11} />
              <YAxis stroke="#718096" fontSize={11} domain={[0, 2]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1e22",
                  borderColor: "#2c3136",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
              />
              <Bar dataKey="posts" name="Posts" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="videos" name="Videos" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
