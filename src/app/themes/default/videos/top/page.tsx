import React from "react";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { getServerTranslations } from "@/lib/translations/server";
import { VideoOff } from "lucide-react";
import { TopVideosFilter } from "./TopVideosFilter";

export const revalidate = 30;

interface TopVideosPageProps {
  searchParams?: Promise<{ type?: string }>;
}

export default async function TopVideosPage({ searchParams }: TopVideosPageProps) {
  const { t } = await getServerTranslations();
  const resolvedParams = searchParams ? await searchParams : {};
  const currentType = resolvedParams.type || "all";

  const conditions = [eq(videos.privacy, 0)];
  const now = new Date();

  if (currentType === "today") {
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    conditions.push(gte(videos.createdAt, dayAgo));
  } else if (currentType === "this_week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    conditions.push(gte(videos.createdAt, weekAgo));
  } else if (currentType === "this_month") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    conditions.push(gte(videos.createdAt, monthAgo));
  } else if (currentType === "this_year") {
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    conditions.push(gte(videos.createdAt, yearAgo));
  }

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
    .where(and(...conditions))
    .orderBy(desc(videos.views), desc(videos.createdAt))
    .limit(24);

  return (
    <div className="w-full space-y-6">
      {/* Top Filter Rail: Time pills with prev/next buttons (matching Popular Channels filter) */}
      <TopVideosFilter currentType={currentType} />

      {/* Empty State matching PlayTube Screenshot */}
      {topVideos.length === 0 ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t("no_videos_found_for_now", "No videos found for now!")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-7 gap-4">
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
