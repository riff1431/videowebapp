"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { videos, comments, siteConfig, users, categories } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Manage Videos Actions
// ==========================================

export async function deleteVideoAction(id: number) {
  await assertAdmin();
  try {
    await db.delete(videos).where(eq(videos.id, id));
    revalidatePath("/admin/manage-videos");
    revalidatePath("/admin/videos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete video" };
  }
}

export async function bulkDeleteVideosAction(ids: number[]) {
  await assertAdmin();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: "No videos selected" };
    }
    await db.delete(videos).where(inArray(videos.id, ids));
    revalidatePath("/admin/manage-videos");
    revalidatePath("/admin/videos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete selected videos" };
  }
}

export async function toggleApproveVideoAction(id: number, approve: boolean) {
  await assertAdmin();
  try {
    await db.update(videos).set({ isApproved: approve }).where(eq(videos.id, id));
    revalidatePath("/admin/manage-videos");
    revalidatePath("/admin/videos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update video approval" };
  }
}

export async function addFakeViewsAction(id: number, viewsToAdd: number) {
  await assertAdmin();
  try {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + ${viewsToAdd}` })
      .where(eq(videos.id, id));
    revalidatePath("/admin/manage-videos");
    revalidatePath("/admin/videos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add fake views" };
  }
}

// ==========================================
// 2. Manage Comments Actions
// ==========================================

export async function deleteCommentAction(id: number) {
  await assertAdmin();
  try {
    await db.delete(comments).where(eq(comments.id, id));
    revalidatePath("/admin/manage-comments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete comment" };
  }
}

export async function bulkDeleteCommentsAction(ids: number[]) {
  await assertAdmin();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: "No comments selected" };
    }
    await db.delete(comments).where(inArray(comments.id, ids));
    revalidatePath("/admin/manage-comments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete selected comments" };
  }
}

// ==========================================
// 3. Import Videos Actions (YouTube / Dailymotion / Twitch)
// ==========================================

export interface ImportedVideoPayload {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  tags?: string;
  duration?: string;
  categoryId?: string;
  subCategory?: string;
  videoType: "youtube" | "dailymotion" | "twitch" | "local";
  videoLocation: string;
  youtubeUrl?: string;
  username?: string;
}

export async function importVideosAction(items: ImportedVideoPayload[]) {
  await assertAdmin();
  try {
    if (!items || items.length === 0) {
      return { success: false, error: "No videos provided to import" };
    }

    // Default admin user or specified username
    let defaultUserId = 1;
    const adminUser = await db.select({ id: users.id }).from(users).where(eq(users.isAdmin, true)).limit(1);
    if (adminUser.length > 0) {
      defaultUserId = adminUser[0].id;
    }

    let importedCount = 0;

    for (const item of items) {
      let targetUserId = defaultUserId;
      if (item.username) {
        const u = await db.select({ id: users.id }).from(users).where(eq(users.username, item.username)).limit(1);
        if (u.length > 0) {
          targetUserId = u[0].id;
        }
      }

      // Check if video already exists
      const existing = await db.select({ id: videos.id }).from(videos).where(eq(videos.videoId, item.videoId)).limit(1);
      if (existing.length > 0) {
        continue;
      }

      await db.insert(videos).values({
        videoId: item.videoId,
        userId: targetUserId,
        title: item.title,
        description: item.description || "",
        thumbnail: item.thumbnail,
        videoLocation: item.videoLocation,
        videoType: item.videoType,
        youtubeUrl: item.youtubeUrl || "",
        duration: item.duration || "00:00",
        categoryId: item.categoryId || "other",
        subCategory: item.subCategory || "",
        tags: item.tags || "",
        privacy: 0, // Public
        isApproved: true,
      });

      importedCount++;
    }

    revalidatePath("/admin/manage-videos");
    revalidatePath("/admin/videos");
    return { success: true, count: importedCount };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to import videos" };
  }
}

// ==========================================
// 4. Site Config Settings for Twitch & YouTube
// ==========================================

export async function getAdminVideoSettings() {
  await assertAdmin();
  try {
    const configs = await db.select().from(siteConfig);
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.name] = c.value;
    }
    return configMap;
  } catch {
    return {};
  }
}
