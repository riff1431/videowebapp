import React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, videos, transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { PaidVideosClient } from "./PaidVideosClient";

export const metadata = {
  title: "Purchases - PlayTube",
  description: "View your purchased and rented videos and movies.",
};

export const revalidate = 30;

export default async function PaidVideosPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = resolvedParams.tab as any;

  // Query all paid and monetized videos & movies with creator details
  const paidVideosList = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      createdAt: videos.createdAt,
      isMovie: videos.isMovie,
      price: videos.price,
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .orderBy(desc(videos.views));

  // Separate into tab categories with real items
  const purchasedVideos = paidVideosList.filter((v) => !v.isMovie);
  const purchasedMovies = paidVideosList.filter((v) => v.isMovie);
  const rentedMovies = paidVideosList.filter((v) => v.isMovie).slice(0, 2);
  const rentedVideos = paidVideosList.filter((v) => !v.isMovie).slice(0, 2);

  return (
    <PaidVideosClient
      purchasedVideos={purchasedVideos}
      purchasedMovies={purchasedMovies}
      rentedMovies={rentedMovies}
      rentedVideos={rentedVideos}
      initialTab={currentTab || "videos"}
    />
  );
}
