import React from "react";
import { db } from "@/db";
import { videoAds } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ManageVideoAdsClient } from "@/components/admin/ManageVideoAdsClient";

export const dynamic = "force-dynamic";

export default async function AdminManageVideoAdsPage() {
  const rows = await db
    .select()
    .from(videoAds)
    .orderBy(desc(videoAds.createdAt));

  const initialAds = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type || "video",
    adMedia: r.adMedia,
    adUrl: r.adUrl,
    clicks: r.clicks ?? 0,
    views: r.views ?? 0,
    duration: r.duration ?? 10,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ManageVideoAdsClient initialAds={initialAds} />;
}
