import React from "react";
import { db } from "@/db";
import { videos, users, watchHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/require-auth";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const session = await requireAuth("/history");
  const targetUserId = Number(session.user.id);

  const historyVideos = await db
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
    .from(watchHistory)
    .innerJoin(videos, eq(watchHistory.videoId, videos.id))
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(watchHistory.userId, targetUserId))
    .orderBy(desc(watchHistory.viewedAt))
    .limit(50);

  return <HistoryClient initialVideos={historyVideos} />;
}
