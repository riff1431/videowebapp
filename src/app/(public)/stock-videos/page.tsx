import React, { Suspense } from "react";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { StockVideosClient, StockVideoItem } from "./StockVideosClient";

export const metadata = {
  title: "Stock Videos - PlayTube",
  description: "Browse and download royalty-free 4K and HD stock video footage.",
};

export const revalidate = 30;

export default async function StockVideosPage() {
  const rawStockVideos = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      description: videos.description,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      price: videos.price,
      license: videos.license,
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
        eq(videos.categoryId, "film"),
        eq(videos.categoryId, "tech")
      )
    )
    .orderBy(desc(videos.views))
    .limit(30);

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[50vh] flex items-center justify-center text-neutral-400 text-sm">
          Loading stock videos...
        </div>
      }
    >
      <StockVideosClient initialVideos={rawStockVideos as StockVideoItem[]} />
    </Suspense>
  );
}
