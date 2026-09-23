"use server";

import { db } from "@/db";
import { videos, likesDislikes, comments, subscriptions, watchLater, siteConfig, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==========================================
// 1. Video Upload Server Action
// ==========================================
const uploadVideoSchema = z.object({
  title: z.string().min(3).max(250),
  description: z.string().optional(),
  categoryId: z.string().default("other"),
  videoLocation: z.string().url().or(z.string().min(1)),
  thumbnail: z.string().optional(),
  duration: z.string().default("00:00"),
  privacy: z.coerce.number().default(0),
});

export async function uploadVideoAction(formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: (formData.get("categoryId") as string) || "other",
      videoLocation: formData.get("videoLocation") as string,
      thumbnail: formData.get("thumbnail") as string,
      privacy: formData.get("privacy") ? Number(formData.get("privacy")) : 0,
    };

    const parsed = uploadVideoSchema.parse(rawData);

    // Get default admin or first user as creator
    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "No user found to associate with video" };
    }

    const videoId = "pt_" + Math.random().toString(36).substring(2, 10);

    const [newVideo] = await db
      .insert(videos)
      .values({
        videoId,
        userId: user.id,
        title: parsed.title,
        description: parsed.description || "",
        categoryId: parsed.categoryId,
        videoLocation: parsed.videoLocation,
        thumbnail:
          parsed.thumbnail ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
        duration: "03:45",
        privacy: parsed.privacy,
        videoType: "video/mp4",
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/admin/videos");

    return { success: true, videoId: newVideo.videoId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload video" };
  }
}

// ==========================================
// 2. Video Like / Dislike Toggle Action
// ==========================================
export async function toggleLikeVideoAction({
  videoDbId,
  type,
}: {
  videoDbId: number;
  type: 1 | 2; // 1: like, 2: dislike
}) {
  try {
    const [user] = await db.select().from(users).limit(1);
    if (!user) return { success: false, error: "Unauthorized" };

    const [existing] = await db
      .select()
      .from(likesDislikes)
      .where(
        and(
          eq(likesDislikes.userId, user.id),
          eq(likesDislikes.videoId, videoDbId)
        )
      );

    if (existing) {
      if (existing.type === type) {
        // Remove vote
        await db
          .delete(likesDislikes)
          .where(eq(likesDislikes.id, existing.id));

        if (type === 1) {
          await db
            .update(videos)
            .set({ likes: sql`${videos.likes} - 1` })
            .where(eq(videos.id, videoDbId));
        } else {
          await db
            .update(videos)
            .set({ dislikes: sql`${videos.dislikes} - 1` })
            .where(eq(videos.id, videoDbId));
        }
      } else {
        // Change vote
        await db
          .update(likesDislikes)
          .set({ type })
          .where(eq(likesDislikes.id, existing.id));

        if (type === 1) {
          await db
            .update(videos)
            .set({
              likes: sql`${videos.likes} + 1`,
              dislikes: sql`GREATEST(0, ${videos.dislikes} - 1)`,
            })
            .where(eq(videos.id, videoDbId));
        } else {
          await db
            .update(videos)
            .set({
              dislikes: sql`${videos.dislikes} + 1`,
              likes: sql`GREATEST(0, ${videos.likes} - 1)`,
            })
            .where(eq(videos.id, videoDbId));
        }
      }
    } else {
      // New vote
      await db.insert(likesDislikes).values({
        userId: user.id,
        videoId: videoDbId,
        type,
      });

      if (type === 1) {
        await db
          .update(videos)
          .set({ likes: sql`${videos.likes} + 1` })
          .where(eq(videos.id, videoDbId));
      } else {
        await db
          .update(videos)
          .set({ dislikes: sql`${videos.dislikes} + 1` })
          .where(eq(videos.id, videoDbId));
      }
    }

    revalidatePath("/watch/[videoId]", "page");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 3. Add Comment Server Action
// ==========================================
export async function addCommentAction({
  videoDbId,
  text,
}: {
  videoDbId: number;
  text: string;
}) {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: "Comment text cannot be empty" };
    }

    const [user] = await db.select().from(users).limit(1);
    if (!user) return { success: false, error: "Unauthorized" };

    const [newComment] = await db
      .insert(comments)
      .values({
        userId: user.id,
        videoId: videoDbId,
        text: text.trim(),
      })
      .returning();

    revalidatePath("/watch/[videoId]", "page");
    return { success: true, comment: newComment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. Toggle Subscription Action
// ==========================================
export async function toggleSubscribeAction({
  channelUserId,
}: {
  channelUserId: number;
}) {
  try {
    const [currentUser] = await db.select().from(users).limit(1);
    if (!currentUser) return { success: false, error: "Unauthorized" };

    if (currentUser.id === channelUserId) {
      return { success: false, error: "Cannot subscribe to your own channel" };
    }

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, currentUser.id),
          eq(subscriptions.channelId, channelUserId)
        )
      );

    if (existing) {
      await db
        .delete(subscriptions)
        .where(eq(subscriptions.id, existing.id));
      return { success: true, subscribed: false };
    } else {
      await db.insert(subscriptions).values({
        subscriberId: currentUser.id,
        channelId: channelUserId,
      });
      return { success: true, subscribed: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
