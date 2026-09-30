import React from "react";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { VideoCard } from "@/components/common/VideoCard";
import { Video, VideoOff, Download, Sparkles } from "lucide-react";

export const revalidate = 30;

export default async function StockVideosPage() {
  const stockVideos = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      quality: videos.quality,
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
    .where(
      or(
        eq(videos.categoryId, "stock"),
        eq(videos.categoryId, "tech"),
        eq(videos.categoryId, "film")
      )
    )
    .orderBy(desc(videos.views))
    .limit(24);

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle Icon */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Video className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              Stock Videos
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#04abf2] bg-[#04abf2]/10 px-3 py-1 rounded-full font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Royalty-Free 4K / HD Media</span>
        </div>
      </div>

      {stockVideos.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No stock videos found for now!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stockVideos.map((video) => (
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
