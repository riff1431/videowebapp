import React from "react";
import { db } from "@/db";
import { categories, languages } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  ManageCategoriesClient,
  CategoryItem,
} from "@/components/admin/ManageCategoriesClient";

export const dynamic = "force-dynamic";

export default async function ManageCategoriesPage() {
  const [rawCategories, rawLangs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ name: languages.name }).from(languages),
  ]);

  const defaultLanguages = [
    "English", "Arabic", "Dutch", "French", "German", "Russian",
    "Spanish", "Turkish", "Hindi", "Chinese", "Urdu", "Indonesian",
    "Croatian", "Hebrew", "Bengali", "Japanese", "Portuguese", "Italian",
    "Persian", "Swedish", "Vietnamese", "Danish", "Filipino"
  ];

  const availableLanguages =
    rawLangs.length > 0
      ? Array.from(new Set([...defaultLanguages, ...rawLangs.map((l) => l.name)]))
      : defaultLanguages;

  const initialCategories: CategoryItem[] = rawCategories.map((c: any) => {
    let parsedTranslations: Record<string, string> = {};
    try {
      if (c.translations) {
        parsedTranslations = JSON.parse(c.translations);
      }
    } catch {
      parsedTranslations = {};
    }

    return {
      id: c.id,
      key: c.key,
      name: c.name,
      translations: parsedTranslations,
    };
  });

  return (
    <ManageCategoriesClient
      initialCategories={initialCategories}
      availableLanguages={availableLanguages}
    />
  );
}
