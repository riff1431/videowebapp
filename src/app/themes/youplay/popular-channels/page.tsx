import React from "react";
import { db } from "@/db";
import { users, videos, subscriptions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { PopularChannelsHero } from "@/components/channels/PopularChannelsHero";
import { ChannelCard, ChannelItem } from "@/components/channels/ChannelCard";
import { VideoOff } from "lucide-react";

import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/config";

export const revalidate = 30;

interface PopularChannelsProps {
  searchParams?: Promise<{
    type?: string;
    time?: string;
  }>;
}

export default async function PopularChannelsPage({ searchParams }: PopularChannelsProps) {
  const config = await getSiteConfig(["popular_channels"]);
  if (config["popular_channels"] === "off" || config["popular_channels"] === "0") {
    notFound();
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const sortMetric = resolvedParams.type || "views"; // views, subscribers, active
  const timeMetric = resolvedParams.time || "all_time"; // today, this_week, this_month, this_year, all_time

  // Calculate cutoff date if filtering by time
  const now = new Date();
  let timeCutoff: Date | null = null;

  if (timeMetric === "today") {
    timeCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeMetric === "this_week") {
    timeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeMetric === "this_month") {
    timeCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (timeMetric === "this_year") {
    timeCutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }

  // Construct conditional SQL for time window
  const videoTimeSql = timeCutoff
    ? sql`and ${videos.createdAt} >= ${timeCutoff}`
    : sql``;

  // Query channels with aggregate stats
  const rawChannels = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      cover: users.cover,
      verified: users.verified,
      totalViews: sql<number>`coalesce(sum(case when ${videos.privacy} = 0 ${videoTimeSql} then ${videos.views} else 0 end), 0)::int`,
      videoCount: sql<number>`count(distinct case when ${videos.privacy} = 0 ${videoTimeSql} then ${videos.id} else null end)::int`,
      subscriberCount: sql<number>`count(distinct ${subscriptions.id})::int`,
    })
    .from(users)
    .leftJoin(videos, eq(users.id, videos.userId))
    .leftJoin(subscriptions, eq(users.id, subscriptions.channelId))
    .groupBy(users.id);

  let filtered = rawChannels;
  if (timeMetric !== "all_time") {
    filtered = rawChannels.filter((c) => {
      if (sortMetric === "active") return c.videoCount > 0;
      if (sortMetric === "views") return c.totalViews > 0;
      return c.videoCount > 0 || c.totalViews > 0;
    });
  } else {
    // Show creators that have content, views, or subscribers
    filtered = rawChannels.filter(
      (c) => c.videoCount > 0 || c.totalViews > 0 || c.subscriberCount > 0
    );
  }

  // Sort channels according to sortMetric
  filtered.sort((a, b) => {
    if (sortMetric === "subscribers") {
      if (b.subscriberCount !== a.subscriberCount) {
        return b.subscriberCount - a.subscriberCount;
      }
      return b.totalViews - a.totalViews;
    }
    if (sortMetric === "active") {
      if (b.videoCount !== a.videoCount) {
        return b.videoCount - a.videoCount;
      }
      return b.totalViews - a.totalViews;
    }
    // Default: views
    if (b.totalViews !== a.totalViews) {
      return b.totalViews - a.totalViews;
    }
    return b.videoCount - a.videoCount;
  });

  // Check current user subscriptions for button state
  const [currentUser] = await db.select({ id: users.id }).from(users).limit(1);
  let userSubscribedSet = new Set<number>();
  if (currentUser) {
    const userSubs = await db
      .select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(eq(subscriptions.subscriberId, currentUser.id));
    userSubscribedSet = new Set(userSubs.map((s) => s.channelId));
  }

  const channels: ChannelItem[] = filtered.map((c, index) => ({
    ...c,
    rank: index + 1,
    isSubscribed: userSubscribedSet.has(c.id),
  }));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner with exact purple background, flame-heart, and dropdowns */}
      <PopularChannelsHero initialType={sortMetric} initialTime={timeMetric} />

      {/* Main Content Area: Channels or Empty State (matching 2nd image 1:1) */}
      {channels.length === 0 ? (
        <div className="min-h-[35vh] flex flex-col items-center justify-center text-center py-16">
          <div className="w-20 h-20 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center mb-4 shadow-xs">
            <VideoOff className="w-9 h-9 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-normal text-neutral-700 dark:text-neutral-300">
            No channels found
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
