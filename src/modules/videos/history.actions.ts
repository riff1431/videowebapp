"use server";

import { db } from "@/db";
import { watchHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Clear all watch history for the current authenticated user
 */
export async function clearWatchHistoryAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to clear your history." };
    }

    const userId = Number(session.user.id);
    await db.delete(watchHistory).where(eq(watchHistory.userId, userId));

    revalidatePath("/history");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to clear watch history.",
    };
  }
}

/**
 * Remove a specific video from the user's watch history
 */
export async function removeVideoFromHistoryAction(videoId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to manage your history." };
    }

    const userId = Number(session.user.id);
    await db
      .delete(watchHistory)
      .where(
        and(eq(watchHistory.userId, userId), eq(watchHistory.videoId, videoId))
      );

    revalidatePath("/history");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to remove video from history.",
    };
  }
}

/**
 * Record a video view in the user's watch history
 */
export async function recordWatchHistoryAction(videoId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) return { success: false };

    const userId = Number(session.user.id);

    // Remove any existing entry so the video moves to the top of history
    await db
      .delete(watchHistory)
      .where(
        and(eq(watchHistory.userId, userId), eq(watchHistory.videoId, videoId))
      );

    // Insert new entry with current timestamp
    await db.insert(watchHistory).values({
      userId,
      videoId,
      viewedAt: new Date(),
    });

    revalidatePath("/history");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}
