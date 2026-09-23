import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ThumbsUp } from "lucide-react";

export default async function LikedVideosPage() {
  const likedVideos = await db
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
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Liked Videos
            </h1>
            <p className="text-xs text-gray-500">
              Videos that received your thumbs up
            </p>
          </div>
        </div>

        {likedVideos.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            You haven't liked any videos yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {likedVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
