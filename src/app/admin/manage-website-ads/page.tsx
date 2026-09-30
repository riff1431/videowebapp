import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { ManageWebsiteAdsClient } from "@/components/admin/ManageWebsiteAdsClient";

export const dynamic = "force-dynamic";

export default async function AdminManageWebsiteAdsPage() {
  const adKeys = ["header_ad", "footer_ad", "watch_side_bar_ad", "watch_comments_ad"];
  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, adKeys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return <ManageWebsiteAdsClient initialConfig={configObj} />;
}
