import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { AdsSettingsClient } from "@/components/admin/AdsSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminAdsSettingsPage() {
  const keys = [
    "user_ads",
    "who_can_ads",
    "ad_v_price",
    "ad_c_price",
    "m_withdrawal",
    "video_monetization",
    "who_can_monetize",
    "monetization_approval",
    "pub_price",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, keys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return <AdsSettingsClient initialConfig={configObj} />;
}
