import React from "react";
import { db } from "@/db";
import { categories, siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ImportFromYouTubeClient } from "@/components/admin/ImportFromYouTubeClient";

export const dynamic = "force-dynamic";

export default async function ImportFromYouTubePage() {
  const [cats, ytConfig] = await Promise.all([
    db.select({ key: categories.key, name: categories.name }).from(categories),
    db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.name, "yt_api"))
      .limit(1),
  ]);

  const hasApiKey = Boolean(ytConfig[0]?.value?.trim());

  return (
    <ImportFromYouTubeClient
      categoriesList={cats}
      ytApiKeyConfigured={hasApiKey}
    />
  );
}
