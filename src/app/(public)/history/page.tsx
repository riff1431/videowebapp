import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { History as HistoryIcon, Trash2 } from "lucide-react";

export default async function HistoryPage() {
  const historyVideos = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      createdAt: videos.createdAt,
      channel: {
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .orderBy(desc(videos.createdAt))
    .limit(20);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Watch History
              </h1>
              <p className="text-xs text-gray-500">
                Videos you have previously viewed
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {historyVideos.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            Your watch history is currently empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {historyVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
