import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VideoCard } from "@/components/common/VideoCard";
import { db } from "@/db";
import { users, videos, subscriptions } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CheckCircle2, Bell, Video as VideoIcon } from "lucide-react";

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
    .where(eq(videos.userId, channelUser.id))
    .orderBy(desc(videos.createdAt));

  const displayName = channelUser.name || channelUser.username;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PlayTube Banner & Cover Container matching themes/youplay/layout/timeline/content.html */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-950 border border-gray-200 dark:border-zinc-800 h-44 sm:h-64 shadow-xs">
          {/* Fallback Banner Graphic */}
          <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80')` }} />
          
          <div className="absolute bottom-4 left-6 flex items-end gap-5">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden shadow-lg bg-zinc-700 shrink-0">
              {channelUser.avatar ? (
                <img
                  src={channelUser.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-white">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                  {displayName}
                </h1>
                {channelUser.verified && (
                  <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                )}
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                @{channelUser.username} • {subsCount.value} subscribers • {channelVideos.length} videos
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Subscribe
            </button>
          </div>
        </div>

        {/* Tab Navigation matching PlayTube */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-zinc-800 text-sm font-semibold">
          <button className="text-red-600 border-b-2 border-red-600 pb-3 px-1">
            Videos ({channelVideos.length})
          </button>
          <button className="text-gray-500 hover:text-gray-800 dark:hover:text-white pb-3 px-1 transition-colors">
            Playlists
          </button>
          <button className="text-gray-500 hover:text-gray-800 dark:hover:text-white pb-3 px-1 transition-colors">
            About
          </button>
        </div>

        {/* Videos Grid */}
        {channelVideos.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mx-auto">
              <VideoIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              This channel has not uploaded any videos yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {channelVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
