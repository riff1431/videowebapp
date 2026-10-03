"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import {
  getUserNotifications,
  markNotificationsAsSeen,
} from "@/services/notification.service";

async function getCurrentUserId(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.id ? Number(session.user.id) : null;
  } catch {
    return null;
  }
}

export async function fetchUserNotificationsAction() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, notifications: [], unreadCount: 0 };
  }
  return getUserNotifications(userId);
}

export async function markNotificationsReadAction() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false };
  }
  return markNotificationsAsSeen(userId);
}
