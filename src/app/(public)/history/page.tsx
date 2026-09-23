import React from "react";
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
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .orderBy(desc(videos.createdAt))
    .limit(20);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              Watch History
            </h1>
            <p className="text-xs text-neutral-500">
              Videos you have previously viewed
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-md border border-[var(--border)] cursor-pointer shadow-2xs">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {historyVideos.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          Your watch history is currently empty.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {historyVideos.map((v) => (
            <VideoCard
              key={v.id}
              videoId={v.videoId}
              title={v.title}
              thumbnail={v.thumbnail}
              duration={v.duration}
              views={v.views}
              createdAt={v.createdAt}
              user={v.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
