import React from "react";
import { db } from "@/db";
import { users, sessions, categories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { SettingsClient } from "../SettingsClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

interface SettingsTabProps {
  params: Promise<{ tab: string }>;
}

export default async function SettingsTabPage({ params }: SettingsTabProps) {
  const resolvedParams = await params;
  const currentTab = resolvedParams.tab || "profile";

  let currentUser: any = null;
  let activeSessions: any[] = [];
  let categoryList: Array<{ id: number; key: string; name: string }> = [];

  try {
    categoryList = await db
      .select({ id: categories.id, key: categories.key, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch (e) {
    console.error("Failed to query categories in settings tab:", e);
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(session.user.id)))
        .limit(1);
      currentUser = u;

      activeSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, Number(session.user.id)))
        .orderBy(desc(sessions.createdAt))
        .limit(10);
    }
  } catch (e) {
    // ignore
  }

  if (!currentUser) {
    // Fallback to first user for preview / local testing
    const [u] = await db.select().from(users).limit(1);
    currentUser = u || {
      id: 1,
      name: "Site Admin",
      username: "admin",
      email: "admin@example.com",
      gender: "male",
      countryId: 0,
      age: 0,
      wallet: 0,
      balance: 0,
      about: "",
      avatar: "/upload/photos/d-avatar.jpg",
      cover: "/upload/photos/d-cover.jpg",
      role: "admin",
      isAdmin: true,
      verified: false,
      isPro: false,
      active: true,
      google: "",
      facebook: "",
      twitter: "",
      instagram: "",
    };
  }

  return (
    <SettingsClient
      currentTab={currentTab}
      user={currentUser}
      sessionsList={activeSessions}
      categories={categoryList}
    />
  );
}
