import React from "react";
import { db } from "@/db";
import { categories, siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ImportFromTwitchClient } from "@/components/admin/ImportFromTwitchClient";

export const dynamic = "force-dynamic";

export default async function ImportFromTwitchPage() {
  const [cats, twitchConfig] = await Promise.all([
    db.select({ key: categories.key, name: categories.name }).from(categories),
    db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.name, "twitch_api"))
      .limit(1),
  ]);

  const hasTwitchClientId = Boolean(twitchConfig[0]?.value?.trim());

  return (
    <ImportFromTwitchClient
      categoriesList={cats}
      hasTwitchClientId={hasTwitchClientId}
    />
  );
}
