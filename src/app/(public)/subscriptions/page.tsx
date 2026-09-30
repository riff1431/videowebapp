import React from "react";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { videos, users, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { List, VideoOff } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";

export const metadata = {
  title: "Subscriptions - PlayTube",
  description: "Videos from channels you are subscribed to.",
};

export const revalidate = 0; // Dynamic feed

export default async function SubscriptionsPage() {
  const session = await requireAuth("/subscriptions");
  const targetUserId = Number(session.user.id);

  // Query videos from channels the user is subscribed to
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
    .innerJoin(subscriptions, eq(videos.userId, subscriptions.channelId))
    .where(eq(subscriptions.subscriberId, targetUserId))
    .orderBy(desc(videos.createdAt))
    .limit(30);

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle List Icon matching PlayTube UI */}
      <div className="flex items-center gap-2.5 pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
          <List className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Subscriptions
        </h1>
      </div>

      {/* Empty State matching PlayTube Reference Screenshot */}
      {feedVideos.length === 0 ? (
        <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No videos found, subscribe to get started!
          </p>
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
