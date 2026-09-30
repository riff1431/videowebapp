import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users, watchLater } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { VideoCard } from "@/components/common/VideoCard";
import { Bookmark } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";

export const revalidate = 0; // Dynamic

export default async function SavedVideosPage() {
  const session = await requireAuth("/saved-videos");
  const targetUserId = Number(session.user.id);

  const savedList = await db
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
        .from(watchLater)
        .innerJoin(videos, eq(watchLater.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(eq(watchLater.userId, targetUserId))
        .orderBy(desc(watchLater.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Saved Videos (Watch Later)</h1>
            <p className="text-xs text-neutral-500">Your personal queue of bookmarked videos</p>
          </div>
        </div>
      </div>

      {savedList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          <p className="text-neutral-500 text-sm">You haven&apos;t saved any videos yet.</p>
          <Link
            href="/"
            className="inline-block mt-3 px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors shadow-xs"
          >
            Explore Videos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedList.map((video) => (
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
