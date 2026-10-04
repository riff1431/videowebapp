import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { getServerTranslations } from "@/lib/translations/server";
import { Video, VideoOff, BarChart2, Calendar } from "lucide-react";

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

  const filterTabs = [
    { type: "all", label: t("all_time", "All Time"), icon: BarChart2 },
    { type: "today", label: t("today", "Today"), icon: Calendar },
    { type: "this_week", label: t("this_week", "This week"), icon: Calendar },
    { type: "this_month", label: t("this_month", "This month"), icon: Calendar },
    { type: "this_year", label: t("this_year", "This year"), icon: Calendar },
  ];

  return (
    <div className="w-full">
      {/* Centered Floating Time Filter Bar (PlayTube Screenshot Parity) */}
      <div className="flex justify-center mb-10">
        <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-1.5 shadow-xs flex items-center gap-1.5">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentType === tab.type;
            const href = tab.type === "all" ? "/videos/top" : `/videos/top?type=${tab.type}`;

            return (
              <Link
                key={tab.type}
                href={href}
                className={`min-w-[68px] sm:min-w-[76px] py-2 px-3 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center ${isActive
                  ? "bg-[#dff2fc] dark:bg-[#04abf2]/20 text-[#04abf2] font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-[#04abf2] stroke-[2.5]" : "text-neutral-500 stroke-[1.75]"
                    }`}
                />
                <span className="text-[11px] whitespace-nowrap leading-tight">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

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
