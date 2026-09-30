import React from "react";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users, watchHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { History as HistoryIcon, VideoOff, Trash2 } from "lucide-react";

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id ? Number(session.user.id) : null;

  const historyVideos = userId
    ? await db
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
        .from(watchHistory)
        .innerJoin(videos, eq(watchHistory.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(eq(watchHistory.userId, userId))
        .orderBy(desc(watchHistory.viewedAt))
        .limit(40)
    : [];

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle Icon */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <HistoryIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            History
          </h1>
        </div>

        {historyVideos.length > 0 && (
          <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-md border border-[var(--border)] cursor-pointer shadow-2xs">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Empty State matching PlayTube Reference Photo */}
      {historyVideos.length === 0 ? (
        <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No videos found, watch to get started!
          </p>
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
