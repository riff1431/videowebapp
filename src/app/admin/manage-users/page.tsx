import React from "react";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { ManageUsersClient } from "@/components/admin/ManageUsersClient";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ManageUsersPage() {
  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatar: users.avatar,
      active: users.active,
      isPro: users.isPro,
    })
    .from(users)
    .orderBy(asc(users.id));

  // Get active session count / online users
  const activeSessions = await db.select({ ipAddress: sessions.ipAddress, userId: sessions.userId }).from(sessions);
  const ipMap: Record<number, string> = {};
  activeSessions.forEach((s) => {
    if (s.userId && s.ipAddress) {
      ipMap[s.userId] = s.ipAddress;
    }
  });

  const formattedUsers = allUsers.map((u) => ({
    ...u,
    ipAddress: ipMap[u.id] || "172.18.0.1",
  }));

  const onlineCount = activeSessions.length;

  return <ManageUsersClient initialUsers={formattedUsers} onlineCount={onlineCount} />;
}
