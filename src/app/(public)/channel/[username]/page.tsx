import React from "react";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { users, videos, subscriptions } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CheckCircle2, Video as VideoIcon, Layers, Info } from "lucide-react";
import { VideoActionButtons } from "@/components/common/VideoActionButtons";

interface ChannelPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { username } = await params;

  // Query channel user
  const [channelUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!channelUser) {
    notFound();
  }

  // Count channel subscribers
  const [subsCount] = await db
    .select({ value: count() })
    .from(subscriptions)
    .where(eq(subscriptions.channelId, channelUser.id));

  // Query channel uploaded videos
  const channelVideos = await db
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
    .where(eq(videos.userId, channelUser.id))
    .orderBy(desc(videos.createdAt));

  const displayName = channelUser.name || channelUser.username;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PlayTube Banner & Cover Container (#yp_cover) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-800 to-neutral-950 border border-[var(--border)] h-44 sm:h-64 shadow-xs">
        {/* Cover graphic */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url(${
              channelUser.cover ||
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-6 flex items-end gap-5">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden shadow-lg bg-neutral-700 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channelUser.avatar || "/upload/photos/d-avatar.jpg"}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                {displayName}
              </h1>
              {channelUser.verified && (
                <CheckCircle2 className="w-5 h-5 text-[var(--primary)] fill-sky-400/20" />
              )}
            </div>
            <p className="text-xs text-neutral-300 font-medium">
              @{channelUser.username} • {subsCount?.value || 0} subscribers • {channelVideos.length} videos
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-3">
          <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs px-5 py-2.5 rounded-md transition-colors shadow-xs cursor-pointer">
            Subscribe
          </button>
        </div>
      </div>

      {/* Tab Navigation matching PlayTube */}
      <div className="flex items-center gap-6 border-b border-[var(--border)] text-sm font-semibold">
        <button className="text-[var(--primary)] border-b-2 border-[var(--primary)] pb-3 px-1 flex items-center gap-1.5 cursor-pointer">
          <VideoIcon className="w-4 h-4" />
          <span>Videos ({channelVideos.length})</span>
        </button>
        <button className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white pb-3 px-1 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Layers className="w-4 h-4" />
          <span>Playlists</span>
        </button>
        <button className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white pb-3 px-1 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Videos Grid */}
      {channelVideos.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)]">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 mx-auto">
            <VideoIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-neutral-500">
            This channel has not uploaded any videos yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {channelVideos.map((video) => (
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
