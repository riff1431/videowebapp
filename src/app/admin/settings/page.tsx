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

  // Fetch categories for Favourite category selection from database
  const availableCategories = await db
    .select({ key: categories.key, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  // Fetch languages from PostgreSQL
  const dbLanguages = await db
    .select({ key: languages.iso, name: languages.name })
    .from(languages)
    .where(eq(languages.status, "active"))
    .orderBy(asc(languages.name));

  // Deduplicate by key (iso) to avoid React duplicate-key warnings
  const uniqueLanguageMap = new Map<string, { key: string; name: string }>();
  for (const l of dbLanguages) {
    if (!uniqueLanguageMap.has(l.key)) uniqueLanguageMap.set(l.key, l);
  }
  const deduped = Array.from(uniqueLanguageMap.values());

  const availableLanguages = deduped.length > 0
    ? deduped
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
