import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { SiteSettingsClient } from "@/components/admin/SiteSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const allConfigs = await db.select().from(siteConfig);
  const configObj: Record<string, string> = {};
  allConfigs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return <SiteSettingsClient initialConfig={configObj} />;
}
