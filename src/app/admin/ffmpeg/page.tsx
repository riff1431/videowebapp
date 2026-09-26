import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { FfmpegClient } from "@/components/admin/FfmpegClient";

export const dynamic = "force-dynamic";

export default async function AdminFfmpegPage() {
  const allConfigs = await db.select().from(siteConfig);
  const configObj: Record<string, string> = {};
  allConfigs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return <FfmpegClient initialConfig={configObj} />;
}
