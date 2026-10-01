"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Rocket,
  Home,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface MonthlyStat {
  month: string;
  sales: number;
}

interface RecentPaymentsClientProps {
  totalEarnings: number;
  paidSales: number;
  earningsThisMonth: number;
  monthlyStats: MonthlyStat[];
}

export function RecentPaymentsClient({
  totalEarnings,
  paidSales,
  earningsThisMonth,
  monthlyStats,
}: RecentPaymentsClientProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb matching Screenshot 4 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Recent payments
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span className="hover:underline">Pro System</span>
          <span>&gt;</span>
          <span className="text-[#04abf2] font-semibold">
            Recent payments
          </span>
        </nav>
      </div>

      {/* 3 Metric Cards matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL EARNINGS */}
        <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg p-5 shadow-sm">
          <h6 className="text-[11px] font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400 mb-4">
            TOTAL EARNINGS
          </h6>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#3b5998]/10 text-[#3b5998] dark:bg-[#5066e1]/20 dark:text-[#5066e1] flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 font-bold" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {totalEarnings}
            </div>
          </div>
        </div>

        {/* PAID SALES */}
        <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg p-5 shadow-sm">
          <h6 className="text-[11px] font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400 mb-4">
            PAID SALES
          </h6>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#04abf2]/10 text-[#04abf2] flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {paidSales}
            </div>
          </div>
        </div>

        {/* EARNINGS THIS MONTH */}
        <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg p-5 shadow-sm">
          <h6 className="text-[11px] font-bold tracking-wider uppercase text-neutral-600 dark:text-neutral-400 mb-4">
            EARNINGS THIS MONTH
          </h6>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ffb300]/10 text-[#ffb300] flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 font-bold" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {earningsThisMonth}
            </div>
          </div>
        </div>
      </div>

      {/* STATICS Bar Chart matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#1f2024] border border-neutral-200 dark:border-[#2b2f36] rounded-lg p-5 shadow-sm">
        <h6 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-4">
          STATICS
        </h6>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStats} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-neutral-200 dark:text-[#2b2f36]"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                className="text-[11px] text-neutral-400"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-neutral-400"
                tickLine={false}
                axisLine={false}
                domain={[0, (dataMax: number) => Math.max(5, dataMax + 2)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 26, 32, 0.95)",
                  borderColor: "#383d47",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#5066e1" }}
                formatter={(val: any) => [val, "Pro Sales"]}
              />
              <Bar
                dataKey="sales"
                fill="#5066e1"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
