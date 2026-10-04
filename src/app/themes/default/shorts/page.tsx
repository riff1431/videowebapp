import React from "react";
import { db } from "@/db";
import { videos, users, likesDislikes, comments, subscriptions } from "@/db/schema";
import { desc, eq, sql, inArray } from "drizzle-orm";
import { ShortData } from "./ShortsFeedPlayer";
import { ShortsFeed } from "../components/shorts/ShortsFeed";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const revalidate = 0; // Dynamic feed for interactive shorts

interface ShortsPageProps {
  searchParams?: Promise<{ v?: string }>;
}

export default async function ShortsPage({ searchParams }: ShortsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const deepLinkedVideoId = resolvedParams?.v || null;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  // 1. Fetch available shorts
  const rawShorts = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      description: videos.description,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      videoLocation: videos.videoLocation,
      videoType: videos.videoType,
      youtubeUrl: videos.youtubeUrl,
      commentsEnabled: videos.commentsEnabled,
      user: {
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.isShort, true))
    .orderBy(sql`RANDOM()`)
    .limit(30);

  if (rawShorts.length === 0) {
    return <ShortsFeed initialShorts={[]} />;
  }

  const videoIds = rawShorts.map((s) => s.id);
  const authorIds = Array.from(new Set(rawShorts.map((s) => s.user.id)));

  // 2. Fetch aggregated likes count per short
  const likesRows = await db
    .select({
      videoId: likesDislikes.videoId,
      type: likesDislikes.type,
      count: sql<number>`count(*)::int`,
    })
    .from(likesDislikes)
    .where(inArray(likesDislikes.videoId, videoIds))
    .groupBy(likesDislikes.videoId, likesDislikes.type);

  const likesMap: Record<number, { likes: number; dislikes: number }> = {};
  for (const row of likesRows) {
    if (!likesMap[row.videoId]) likesMap[row.videoId] = { likes: 0, dislikes: 0 };
    if (row.type === 1) likesMap[row.videoId].likes = row.count;
    if (row.type === 2) likesMap[row.videoId].dislikes = row.count;
  }

  // 3. Fetch aggregated comments count per short
  const commentsRows = await db
    .select({
      videoId: comments.videoId,
      count: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(inArray(comments.videoId, videoIds))
    .groupBy(comments.videoId);

  const commentsMap: Record<number, number> = {};
  for (const row of commentsRows) {
    commentsMap[row.videoId] = row.count;
  }

  // 4. Fetch user's votes if logged in
  const userVoteMap: Record<number, 1 | 2> = {};
  if (currentUserId) {
    const userVotes = await db
      .select({
        videoId: likesDislikes.videoId,
        type: likesDislikes.type,
      })
      .from(likesDislikes)
      .where(
        sql`${likesDislikes.userId} = ${currentUserId} and ${inArray(likesDislikes.videoId, videoIds)}`
      );
    for (const v of userVotes) {
      userVoteMap[v.videoId] = v.type as 1 | 2;
    }
  }

  // 5. Fetch user's subscriptions if logged in
  const subscribedAuthorSet = new Set<number>();
  if (currentUserId && authorIds.length > 0) {
    const userSubs = await db
      .select({ channelId: subscriptions.channelId })
      .from(subscriptions)
      .where(
        sql`${subscriptions.subscriberId} = ${currentUserId} and ${inArray(subscriptions.channelId, authorIds)}`
      );
    for (const s of userSubs) {
      subscribedAuthorSet.add(s.channelId);
    }
  }

  // If deepLinkedVideoId requested, place that video first if found
  let orderedShorts = [...rawShorts];
  if (deepLinkedVideoId) {
    const foundIdx = orderedShorts.findIndex((s) => s.videoId === deepLinkedVideoId);
    if (foundIdx > 0) {
      const [target] = orderedShorts.splice(foundIdx, 1);
      orderedShorts.unshift(target);
    }
  }

  const initialIndex = 0;

  // Map into ShortData items
  const shortsData: ShortData[] = orderedShorts.map((s) => ({
    ...s,
    likesCount: likesMap[s.id]?.likes || 0,
    dislikesCount: likesMap[s.id]?.dislikes || 0,
    commentsCount: commentsMap[s.id] || 0,
    initialVote: userVoteMap[s.id] || null,
    isSubscribed: subscribedAuthorSet.has(s.user.id),
  }));

  const currentUser = session?.user
    ? {
        id: Number(session.user.id),
        username: (session.user as any).username || session.user.name || "user",
        avatar: (session.user as any).avatar || null,
      }
    : null;

  return (
    <div className="w-full flex-1 h-full min-h-0 flex flex-col">
      <ShortsFeed
        initialShorts={shortsData}
        initialIndex={initialIndex}
        initialVideoId={deepLinkedVideoId}
        user={currentUser}
      />
    </div>
  );
}

