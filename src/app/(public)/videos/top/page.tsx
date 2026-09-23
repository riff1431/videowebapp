import React from "react";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { VideoCard } from "@/components/common/VideoCard";
import { Sparkles } from "lucide-react";

export const revalidate = 30;

export default async function TopVideosPage() {
  const topVideos = await db
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
    .orderBy(desc(videos.views))
    .limit(24);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Top Rated Videos</h1>
            <p className="text-xs text-neutral-500">Highest rated and most watched videos of all time</p>
          </div>
        </div>
      </div>

      {topVideos.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          <p className="text-neutral-500 text-sm">No videos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {topVideos.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              views={video.views}
              createdAt={video.createdAt}
              user={video.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
