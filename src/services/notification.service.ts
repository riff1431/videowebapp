import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: number;
  type: string;
  text: string;
  url?: string;
}

/**
 * Creates a single notification for a user.
 */
export async function createNotification({
  userId,
  type,
  text,
  url = "/",
}: CreateNotificationParams) {
  try {
    const [row] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        text,
        url,
        seen: 0,
      })
      .returning();
    return { success: true, notification: row };
  } catch (err: any) {
    console.error("[NOTIFICATION] Failed to create notification:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches notifications for a user.
 */
export async function getUserNotifications(userId: number, limit = 15) {
  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    const unreadCount = list.filter((n) => n.seen === 0).length;
    return { success: true, notifications: list, unreadCount };
  } catch (err: any) {
    console.error("[NOTIFICATION] Failed to get notifications:", err);
    return { success: false, notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks all notifications as seen for a user.
 */
export async function markNotificationsAsSeen(userId: number) {
  try {
    await db
      .update(notifications)
      .set({ seen: 1 })
      .where(and(eq(notifications.userId, userId), eq(notifications.seen, 0)));
    return { success: true };
  } catch (err: any) {
    console.error("[NOTIFICATION] Failed to mark notifications as seen:", err);
    return { success: false, error: err.message };
  }
}
