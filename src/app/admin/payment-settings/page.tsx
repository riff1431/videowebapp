import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { PaymentSettingsClient } from "@/components/admin/PaymentSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentSettingsPage() {
  const configs = await db.select().from(siteConfig);
  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return <PaymentSettingsClient initialConfig={configObj} />;
}
