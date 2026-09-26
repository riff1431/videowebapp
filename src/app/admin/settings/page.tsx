import React from "react";
import { db } from "@/db";
import { siteConfig, categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { GeneralSettingsClient } from "@/components/admin/GeneralSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminGeneralSettingsPage() {
  // Fetch all site configurations from PostgreSQL database
  const allConfigs = await db.select().from(siteConfig);
  const configObj: Record<string, string> = {};
  allConfigs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  // Fetch categories for Favourite category selection
  const dbCategories = await db
    .select({ key: categories.key, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  const availableCategories = dbCategories.length > 0
    ? dbCategories
    : [
        { key: "film", name: "Film & Animation" },
        { key: "music", name: "Music" },
        { key: "gaming", name: "Gaming" },
        { key: "entertainment", name: "Entertainment" },
        { key: "news", name: "News & Politics" },
        { key: "education", name: "Education" },
        { key: "tech", name: "Science & Technology" },
      ];

  const languages = [
    { key: "english", name: "English" },
    { key: "arabic", name: "Arabic" },
    { key: "dutch", name: "Dutch" },
    { key: "french", name: "French" },
    { key: "german", name: "German" },
    { key: "italian", name: "Italian" },
    { key: "portuguese", name: "Portuguese" },
    { key: "russian", name: "Russian" },
    { key: "spanish", name: "Spanish" },
    { key: "turkish", name: "Turkish" },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <GeneralSettingsClient
      initialConfig={configObj}
      categories={availableCategories}
      languages={languages}
      appUrl={appUrl}
    />
  );
}
