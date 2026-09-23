import { db } from "@/db";
import { videos, users, categories } from "@/db/schema";
import { eq, desc, sql, ilike } from "drizzle-orm";

export interface VideoQueryOptions {
  limit?: number;
  offset?: number;
  categoryId?: string;
  query?: string;
}

export async function getFeaturedVideos(limit = 12) {
  try {
    return await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        description: videos.description,
        thumbnail: videos.thumbnail,
        videoLocation: videos.videoLocation,
        duration: videos.duration,
        views: videos.views,
        categoryId: videos.categoryId,
        createdAt: videos.createdAt,
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
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to fetch featured videos:", error);
    return [];
  }
}

export async function getVideoByVideoId(videoId: string) {
  try {
    const result = await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        description: videos.description,
        thumbnail: videos.thumbnail,
        videoLocation: videos.videoLocation,
        videoType: videos.videoType,
        youtubeUrl: videos.youtubeUrl,
        duration: videos.duration,
        views: videos.views,
        categoryId: videos.categoryId,
        createdAt: videos.createdAt,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          cover: users.cover,
          verified: users.verified,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.videoId, videoId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to get video by ID:", error);
    return null;
  }
}

export async function incrementVideoViews(videoId: string) {
  try {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.videoId, videoId));
  } catch (error) {
    console.error("Failed to increment views:", error);
  }
}

export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}
