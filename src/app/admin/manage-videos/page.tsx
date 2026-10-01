import React from "react";
import { db } from "@/db";
import { videos, users, categories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ManageVideosClient, AdminVideoItem } from "@/components/admin/ManageVideosClient";

export const dynamic = "force-dynamic";

export default async function ManageVideosPage() {
  const [rawVideos, rawCategories] = await Promise.all([
    db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        thumbnail: videos.thumbnail,
        categoryId: videos.categoryId,
        videoType: videos.videoType,
        privacy: videos.privacy,
        isApproved: videos.isApproved,
        price: videos.price,
        views: videos.views,
        duration: videos.duration,
        createdAt: videos.createdAt,
        user: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
        },
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .orderBy(desc(videos.createdAt))
      .limit(500),
    db.select({ key: categories.key, name: categories.name }).from(categories),
  ]);

  const initialVideos: AdminVideoItem[] = rawVideos.map((v) => ({
    id: v.id,
    videoId: v.videoId,
    title: v.title,
    thumbnail: v.thumbnail,
    categoryId: v.categoryId,
    videoType: v.videoType,
    privacy: v.privacy,
    isApproved: v.isApproved,
    price: v.price,
    views: v.views,
    duration: v.duration,
    createdAt: v.createdAt,
    user: v.user?.id
      ? {
          id: v.user.id,
          username: v.user.username,
          avatar: v.user.avatar,
        }
      : null,
  }));

  return (
    <ManageVideosClient
      initialVideos={initialVideos}
      categoriesList={rawCategories}
    />
  );
}
