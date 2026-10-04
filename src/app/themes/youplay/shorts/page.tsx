import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ShortsIcon } from "@/components/common/ShortsIcon";
import { Plus, Play } from "lucide-react";

export const revalidate = 30;

export default async function ShortsPage() {
  // Query exclusively vertical shorts (isShort = true)
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
    .limit(24);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header matching PlayTube Shorts reference screenshot */}
      <div className="flex items-center justify-between pb-4 mb-6">
        {/* Left: Cyan rounded square with white Shorts logo + "Shorts" title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShortsIcon className="w-4 h-4 fill-white text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
            Shorts
          </h1>
        </div>

        {/* Right: + Create button */}
        <Link
          href="/upload-video?type=shorts"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#04abf2] bg-white dark:bg-transparent text-[#04abf2] text-xs font-semibold hover:bg-[#04abf2]/10 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create</span>
        </Link>
      </div>

      {/* Main Content: Empty State or Shorts Grid */}
      {shortsList.length === 0 ? (
        <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center mb-4 text-[#04abf2] shadow-xs">
            <ShortsIcon className="w-10 h-10 fill-current" />
          </div>
          <p className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
            No videos found for now!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {shortsList.map((short) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="relative z-10 space-y-1">
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-2 group-hover:bg-[#04abf2] transition-colors">
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
      )}
    </div>
  );
}
