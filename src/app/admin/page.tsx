import React from "react";
import { db } from "@/db";
import { users, videos, comments, subscriptions, articles, views, likesDislikes, watchLater } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import {
  Video,
  Eye,
  Users,
  UserPlus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from "lucide-react";
import { AdminCharts } from "./AdminCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query all 8 KPI counts safely from the database
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
    db.select({ value: count() }).from(likesDislikes).where(eq(likesDislikes.type, 1)).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(likesDislikes).where(eq(likesDislikes.type, 2)).catch(() => [{ value: 0 }]),
    db.select({ value: count() }).from(watchLater).catch(() => [{ value: 0 }]),
  ]);

  const kpis = [
    {
      title: "TOTAL VIDEOS",
      value: videosCount?.value || 0,
      icon: Video,
      bgColor: "bg-blue-600",
    },
    {
      title: "TOTAL VIEWS",
      value: viewsCount?.value || 0,
      icon: Eye,
      bgColor: "bg-cyan-600",
    },
    {
      title: "TOTAL USERS",
      value: usersCount?.value || 1,
      icon: Users,
      bgColor: "bg-amber-600",
    },
    {
      title: "TOTAL SUBSCRIPTIONS",
      value: subsCount?.value || 0,
      icon: UserPlus,
      bgColor: "bg-purple-600",
    },
    {
      title: "TOTAL VIDEOS COMMENTS",
      value: commentsCount?.value || 0,
      icon: MessageSquare,
      bgColor: "bg-emerald-600",
    },
    {
      title: "TOTAL VIDEOS LIKES",
      value: likesCount?.value || 0,
      icon: ThumbsUp,
      bgColor: "bg-blue-500",
    },
    {
      title: "TOTAL VIDEOS DISLIKES",
      value: dislikesCount?.value || 0,
      icon: ThumbsDown,
      bgColor: "bg-indigo-600",
    },
    {
      title: "TOTAL SAVED VIDEOS",
      value: savedCount?.value || 0,
      icon: Bookmark,
      bgColor: "bg-cyan-700",
    },
  ];

  return (
    <div className="space-y-6 text-[var(--admin-text-main)]">
      {/* Welcome Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--admin-text-main)]">
          Welcome back, admin
        </h1>
      </div>

      {/* Red/Burgundy Alert Banner matching PlayTube */}
      <div className="bg-[var(--admin-alert-bg)] border border-[var(--admin-alert-border)] text-[var(--admin-alert-text)] px-4 py-3 rounded-md text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold">Important!</span>
          <span>There are some errors found on your system, please review System Status.</span>
        </div>
      </div>

      {/* Main Grid: Charts on Left (7 cols), 8 KPI Widgets on Right (5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Analytics Charts */}
        <div className="xl:col-span-7 space-y-6">
          <AdminCharts />
        </div>

        {/* Right Column: 8 KPI Metric Cards (2x4 grid) */}
        <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-4 flex items-center gap-4 shadow-xs"
              >
                <div className={`w-11 h-11 rounded-lg ${kpi.bgColor} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <h3 className="text-xl font-bold text-[var(--admin-text-main)] mt-0.5">
                    {kpi.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
