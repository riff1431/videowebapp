import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { users, videos, subscriptions } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { Trophy, Users, Eye, CheckCircle, Flame, Filter, Video } from "lucide-react";

interface PopularChannelsProps {
  searchParams: Promise<{
    type?: string;
    sort_type?: string;
  }>;
}

export const revalidate = 30;

export default async function PopularChannelsPage({ searchParams }: PopularChannelsProps) {
  const resolvedParams = await searchParams;
  const sortMetric = resolvedParams.type || "views"; // views, subscribers, videos

  // Query channels with aggregate stats
  const channels = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      cover: users.cover,
      verified: users.verified,
      totalViews: sql<number>`coalesce(sum(${videos.views}), 0)`,
      videoCount: sql<number>`count(${videos.id})`,
    })
    .from(users)
    .leftJoin(videos, eq(users.id, videos.userId))
    .groupBy(users.id)
    .orderBy(
      sortMetric === "videos"
        ? desc(sql`count(${videos.id})`)
        : desc(sql`coalesce(sum(${videos.views}), 0)`)
    )
    .limit(30);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header matching PlayTube popular_channels hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[var(--primary)] p-8 text-white shadow-lg mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Creators Hall of Fame</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Popular Channels
          </h1>
          <p className="mt-2 text-sm text-white/90 leading-relaxed">
            Discover top content creators, trendsetters, and video artists ranked by global audience reach.
          </p>

          {/* Metric Selector Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link
              href="/popular-channels?type=views"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                sortMetric === "views"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rank by Views</span>
            </Link>
            <Link
              href="/popular-channels?type=videos"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                sortMetric === "videos"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Rank by Uploads</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Channels Grid matching PlayTube vid_pop_channls */}
      {channels.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            No channels available
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Check back once creators start publishing content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel, index) => {
            const rank = index + 1;
            return (
              <div
                key={channel.id}
                className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative"
              >
                {/* Ranking Badge */}
                <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center text-xs font-extrabold">
                  #{rank}
                </div>

                {/* Cover banner */}
                <div className="h-20 bg-neutral-200 dark:bg-neutral-800 overflow-hidden relative">
                  <img
                    src={channel.cover || "/upload/photos/d-cover.jpg"}
                    alt={channel.name || "Cover"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Avatar & details */}
                <div className="px-5 pb-5 pt-0 -mt-8 flex flex-col items-center text-center flex-1">
                  <Link href={`/channel/${channel.username}`} className="relative block">
                    <img
                      src={channel.avatar || "/upload/photos/d-avatar.jpg"}
                      alt={channel.name || channel.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-sm"
                    />
                    {channel.verified && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-neutral-900">
                        ✓
                      </span>
                    )}
                  </Link>

                  <Link href={`/channel/${channel.username}`} className="mt-2 block">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[var(--primary)] transition-colors">
                      {channel.name || channel.username}
                    </h3>
                  </Link>
                  <p className="text-xs text-neutral-500">@{channel.username}</p>

                  {/* Channel stats strip */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] w-full grid grid-cols-2 gap-2 text-center text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        {Number(channel.totalViews).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-neutral-500">Total Views</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                        {Number(channel.videoCount).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-neutral-500">Videos</span>
                    </div>
                  </div>

                  {/* View Channel Button */}
                  <div className="mt-4 w-full">
                    <Link
                      href={`/channel/${channel.username}`}
                      className="block w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl text-center transition-colors shadow-xs"
                    >
                      Visit Channel
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
