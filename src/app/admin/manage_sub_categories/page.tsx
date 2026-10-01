import React from "react";
import { db } from "@/db";
import { categories, subCategories, languages } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  ManageSubCategoriesClient,
  CategoryParentOption,
  SubCategoryItem,
} from "@/components/admin/ManageSubCategoriesClient";

export const dynamic = "force-dynamic";

export default async function ManageSubCategoriesPage() {
  const [rawCategories, rawSubCategories, rawLangs] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(subCategories).orderBy(asc(subCategories.id)),
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

  const parentCategories: CategoryParentOption[] = rawCategories.map((c) => ({
    key: c.key,
    name: c.name,
  }));

  const initialSubCategories: SubCategoryItem[] = rawSubCategories.map((s) => {
    let parsedTranslations: Record<string, string> = {};
    try {
      if (s.translations) {
        parsedTranslations = JSON.parse(s.translations);
      }
    } catch {
      parsedTranslations = {};
    }

    return {
      id: s.id,
      categoryKey: s.categoryKey,
      key: s.key,
      name: s.name,
      translations: parsedTranslations,
    };
  });

  return (
    <ManageSubCategoriesClient
      parentCategories={parentCategories}
      initialSubCategories={initialSubCategories}
      availableLanguages={availableLanguages}
    />
  );
}
