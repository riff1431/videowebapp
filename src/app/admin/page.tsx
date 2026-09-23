import React from "react";
import { db } from "@/db";
import { users, videos, comments, subscriptions, siteConfig } from "@/db/schema";
import { count } from "drizzle-orm";
import { 
  Video, 
  Users, 
  Eye, 
  MessageSquare, 
  UserPlus, 
  ThumbsUp, 
  Settings, 
  CheckCircle2,
  Clock,
  HardDrive
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query live counts from the PostgreSQL database
  const [[videosCount], [usersCount], [commentsCount], [subsCount]] = await Promise.all([
    db.select({ value: count() }).from(videos),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(comments),
    db.select({ value: count() }).from(subscriptions),
  ]);

  const recentVideos = await db.select().from(videos).limit(5);
  const recentUsers = await db.select().from(users).limit(5);

  const kpis = [
    {
      title: "TOTAL VIDEOS",
      value: videosCount.value,
      icon: Video,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "TOTAL USERS",
      value: usersCount.value,
      icon: Users,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "TOTAL COMMENTS",
      value: commentsCount.value,
      icon: MessageSquare,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "SUBSCRIPTIONS",
      value: subsCount.value,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to the PlayTube Next.js management console. Real-time metrics powered by PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            System Healthy
          </span>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
            Theme: Youplay
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className={`p-5 rounded-2xl bg-white border ${kpi.borderColor} shadow-xs flex items-center justify-between transition-all hover:shadow-md`}
            >
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {kpi.title}
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900">
                  {kpi.value.toLocaleString()}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} ${kpi.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Videos */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-red-600" />
              Recent Videos
            </h3>
            <span className="text-xs text-gray-400">Latest uploads</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentVideos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">
                      No videos uploaded yet.
                    </td>
                  </tr>
                ) : (
                  recentVideos.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-2">
                        <span className="font-medium text-gray-800 line-clamp-1">
                          {v.title}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{(v.views ?? 0).toLocaleString()}</td>
                      <td className="py-3 text-gray-500 text-xs">{v.duration || "00:00"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Registered Users
            </h3>
            <span className="text-xs text-gray-400">Latest members</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <tr>
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">
                      No registered users.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-800 text-xs">
                        @{u.username}
                      </td>
                      <td className="py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {(u.role || "user").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{u.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
