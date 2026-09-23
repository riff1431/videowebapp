import React from "react";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Users as UsersIcon } from "lucide-react";

export default async function SubscriptionsPage() {
  // Query videos from registered channels
  const feedVideos = await db
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
    .limit(24);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
          <UsersIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Subscriptions Feed
          </h1>
          <p className="text-xs text-neutral-500">
            Latest releases from channels you follow
          </p>
        </div>
      </div>

      {feedVideos.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 text-sm bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          No subscription updates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {feedVideos.map((v) => (
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
