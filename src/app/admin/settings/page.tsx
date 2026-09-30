import React from "react";
import { db } from "@/db";
import { siteConfig, categories, languages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
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

  // Fetch languages from PostgreSQL
  const dbLanguages = await db
    .select({ key: languages.iso, name: languages.name })
    .from(languages)
    .where(eq(languages.status, "active"))
    .orderBy(asc(languages.name));

  const availableLanguages = dbLanguages.length > 0
    ? dbLanguages
    : [
        { key: "en", name: "English" },
        { key: "ar", name: "Arabic" },
        { key: "nl", name: "Dutch" },
        { key: "fr", name: "French" },
        { key: "de", name: "German" },
        { key: "it", name: "Italian" },
        { key: "pt", name: "Portuguese" },
        { key: "ru", name: "Russian" },
        { key: "es", name: "Spanish" },
        { key: "tr", name: "Turkish" },
      ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <GeneralSettingsClient
      initialConfig={configObj}
      categories={availableCategories}
      languages={availableLanguages}
      appUrl={appUrl}
    />
  );
}
