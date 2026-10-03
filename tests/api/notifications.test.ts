import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import {
  createNotification,
  getUserNotifications,
  markNotificationsAsSeen,
} from "@/services/notification.service";
import { sendMassNotificationAction } from "@/modules/admin/tools.actions";

describe("Phase 1.6: Notifications System and Mass Dispatch", () => {
  let user1Id: number;
  let user2Id: number;

  beforeAll(async () => {
    // 1. Create two test users
    const [u1] = await db
      .insert(users)
      .values({
        username: "notify_test_user_1",
        email: "notify1@example.com",
        role: "user",
        active: true,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { active: true },
      })
      .returning();
    user1Id = u1.id;

    const [u2] = await db
      .insert(users)
      .values({
        username: "notify_test_user_2",
        email: "notify2@example.com",
        role: "user",
        active: true,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { active: true },
      })
      .returning();
    user2Id = u2.id;
  });

  afterAll(async () => {
    // Clean up test notifications
    await db
      .delete(notifications)
      .where(inArray(notifications.userId, [user1Id, user2Id]));
  });

  it("creates a single notification and retrieves it with correct unread count", async () => {
    const createRes = await createNotification({
      userId: user1Id,
      type: "subscriber",
      text: "User 2 subscribed to your channel.",
      url: "/channel/notify_test_user_2",
    });

    expect(createRes.success).toBe(true);
    expect(createRes.notification).toBeDefined();

    const fetchRes = await getUserNotifications(user1Id);
    expect(fetchRes.success).toBe(true);
    expect(fetchRes.notifications.length).toBeGreaterThanOrEqual(1);
    expect(fetchRes.unreadCount).toBeGreaterThanOrEqual(1);

    const found = fetchRes.notifications.find((n) => n.id === createRes.notification?.id);
    expect(found).toBeDefined();
    expect(found?.text).toBe("User 2 subscribed to your channel.");
    expect(found?.seen).toBe(0);
  });

  it("marks notifications as read", async () => {
    const markRes = await markNotificationsAsSeen(user1Id);
    expect(markRes.success).toBe(true);

    const fetchRes = await getUserNotifications(user1Id);
    expect(fetchRes.unreadCount).toBe(0);
    const unread = fetchRes.notifications.filter((n) => n.seen === 0);
    expect(unread.length).toBe(0);
  });

  it("sendMassNotificationAction inserts notifications for specified users", async () => {
    const assertAdminModule = await import("@/lib/auth/assert-admin");
    const spy = vi.spyOn(assertAdminModule, "assertAdmin").mockResolvedValue({
      id: 1,
      name: "Admin",
      username: "admin",
      email: "admin@playtube.test",
      role: "admin",
      isAdmin: true,
      active: true,
    });

    const res = await sendMassNotificationAction({
      url: "/announcement",
      description: "Platform update: new features released!",
      usernames: "notify_test_user_1, notify_test_user_2",
    });

    spy.mockRestore();

    expect(res.success).toBe(true);

    // Verify user 2 received the mass notification
    const user2Notes = await getUserNotifications(user2Id);
    const massNote = user2Notes.notifications.find((n) => n.type === "mass_notification");
    expect(massNote).toBeDefined();
    expect(massNote?.text).toContain("Platform update");
    expect(massNote?.url).toBe("/announcement");
  });
});
