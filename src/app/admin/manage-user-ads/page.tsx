import React from "react";
import { db } from "@/db";
import { userAds, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ManageUserAdsClient } from "@/components/admin/ManageUserAdsClient";

export const dynamic = "force-dynamic";

export default async function AdminManageUserAdsPage() {
  const rows = await db
    .select({
      id: userAds.id,
      userId: userAds.userId,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatar,
      userWallet: users.wallet,
      url: userAds.url,
      title: userAds.title,
      spent: userAds.spent,
      placement: userAds.placement,
      clicks: userAds.clicks,
      views: userAds.views,
      createdAt: userAds.createdAt,
    })
    .from(userAds)
    .leftJoin(users, eq(userAds.userId, users.id))
    .orderBy(desc(userAds.createdAt));

  const initialAds = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName || r.userUsername || "User",
    userAvatar: r.userAvatar || "/upload/photos/d-avatar.jpg",
    website: r.url,
    title: r.title,
    wallet: r.userWallet ?? 0,
    spent: r.spent ?? 0,
    published: r.createdAt.toLocaleDateString(),
    placement: r.placement || "Videos",
    results: (r.clicks ?? 0) + (r.views ?? 0),
  }));

  return <ManageUserAdsClient initialAds={initialAds} />;
}
