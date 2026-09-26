import React from "react";
import { db } from "@/db";
import {
  users,
  videos,
  comments,
  subscriptions,
  views,
  likesDislikes,
  watchLater,
} from "@/db/schema";
import { count, eq } from "drizzle-orm";
import {
  Video,
  Eye,
  Users,
  UserPlus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
} from "lucide-react";
import { AdminHeaderFilter, AdminSideCharts, CommentsLikesDislikesChart } from "./AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query all 8 KPI counts from the database
  const [
    [videosCount],
    [usersCount],
    [commentsCount],
    [subsCount],
    [viewsCount],
    [likesCount],
    [dislikesCount],
    [savedCount],
  ] = await Promise.all([
    db.select({ value: count() }).from(videos).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(users).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(comments).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(subscriptions).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(views).catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(likesDislikes)
      .where(eq(likesDislikes.type, 1))
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(likesDislikes)
      .where(eq(likesDislikes.type, 2))
      .catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(watchLater).catch(() => [{ value: 0 }]),
  ]);

  // Exact 8 widgets from screenshot 1 & 2
  const kpis = [
    {
      title: "TOTAL VIDEOS",
      value: videosCount?.value || 0,
      icon: Video,
      iconBg: "bg-[#2563eb]", // Rich blue
    },
    {
      title: "TOTAL VIDEOS VIEWS",
      value: viewsCount?.value || 0,
      icon: Eye,
      iconBg: "bg-[#0284c7]", // Rich cyan/sky
    },
    {
      title: "TOTAL USERS",
      value: usersCount?.value || 1,
      icon: Users,
      iconBg: "bg-[#b45309]", // Amber/brown
    },
    {
      title: "TOTAL SUBSCRIPTIONS",
      value: subsCount?.value || 0,
      icon: UserPlus,
      iconBg: "bg-[#9333ea]", // Purple/magenta
    },
    {
      title: "TOTAL VIDEOS COMMENTS",
      value: commentsCount?.value || 0,
      icon: MessageSquare,
      iconBg: "bg-[#15803d]", // Green
    },
    {
      title: "TOTAL VIDEOS LIKES",
      value: likesCount?.value || 0,
      icon: ThumbsUp,
      iconBg: "bg-[#3b82f6]", // Blue
    },
    {
      title: "TOTAL VIDEOS DISLIKES",
      value: dislikesCount?.value || 0,
      icon: ThumbsDown,
      iconBg: "bg-[#0284c7]", // Cyan
    },
    {
      title: "TOTAL SAVED VIDEOS",
      value: savedCount?.value || 0,
      icon: Bookmark,
      iconBg: "bg-[#a16207]", // Gold/brown
    },
  ];

  return (
    <div className="space-y-6 text-[var(--admin-text-main)] w-full max-w-full">
      {/* 1. Full-Width Header: Welcome back, admin + Range Dropdown + System Status Alert */}
      <AdminHeaderFilter />

      {/* 2. Charts & Stats Grid: Left 2 Charts (lg:7) and Right 8 KPI Cards (lg:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Stacked Users Chart & Videos/Posts Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AdminSideCharts
            usersCount={usersCount?.value || 1}
            videosCount={videosCount?.value || 0}
          />
        </div>

        {/* Right Column: 8 KPI Metric Cards (2 cols x 4 rows) enlarged to fill height evenly */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-between">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[var(--admin-card-border)]/80 transition-all min-h-[140px]"
              >
                <p className="text-[11px] font-semibold text-[var(--admin-text-muted)] tracking-wider">
                  {kpi.title}
                </p>

                <div className="flex items-center gap-4 mt-3">
                  <div
                    className={`w-11 h-11 rounded-full ${kpi.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-bold text-[var(--admin-text-main)] tracking-tight">
                    {kpi.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Lower Row: Full-width Comments, Likes, Dislikes Chart */}
      <div className="w-full">
        <CommentsLikesDislikesChart />
      </div>
    </div>
  );
}
