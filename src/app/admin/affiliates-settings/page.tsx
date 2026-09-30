import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { AffiliatesSettingsClient } from "@/components/admin/AffiliatesSettingsClient";

export const dynamic = "force-dynamic";

export default async function AffiliatesSettingsPage() {
  const configs = await db.select().from(siteConfig);
  const configMap: Record<string, string> = {
    affiliate_system: "0",
    affiliate_new_user: "1",
    affiliate_reg_amount: "0.10",
    affiliate_pro_package: "1",
    affiliate_pro_percent: "0",
    affiliate_paid_channel: "1",
    affiliate_channel_percent: "10",
    affiliate_rent_purchase: "1",
    affiliate_rent_percent: "10",
  };

  configs.forEach((c) => {
    configMap[c.name] = c.value;
  });

  return <AffiliatesSettingsClient initialConfig={configMap} />;
}
