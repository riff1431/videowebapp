import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { VideoCard } from "@/components/common/VideoCard";
import { Sparkles, Play } from "lucide-react";

export const revalidate = 30;

export default async function ShortsPage() {
  const shortsList = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      videoLocation: videos.videoLocation,
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.isShort, true))
    .orderBy(desc(videos.createdAt))
    .limit(16);

  // If no shorts flagged explicitly, fallback to latest videos
  const displayShorts = shortsList.length > 0 ? shortsList : (
    await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        thumbnail: videos.thumbnail,
        duration: videos.duration,
        views: videos.views,
        videoLocation: videos.videoLocation,
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
      .limit(8)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">PlayTube Shorts</h1>
            <p className="text-xs text-neutral-500">Bite-sized vertical video feed</p>
          </div>
        </div>

        <Link
          href="/upload-video"
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors shadow-xs"
        >
          Upload Short
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayShorts.map((short) => (
          <Link
            key={short.id}
            href={`/watch/${short.videoId}`}
            className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shadow-md border border-[var(--border)] flex flex-col justify-end p-3 transition-transform hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={short.thumbnail}
              alt={short.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="relative z-10 space-y-1">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-2 group-hover:bg-[var(--primary)] transition-colors">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm">
                {short.title}
              </p>
              <p className="text-[11px] text-white/80">
                {(short.views || 0).toLocaleString()} views
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
