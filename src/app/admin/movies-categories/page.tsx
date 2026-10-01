import React from "react";
import { db } from "@/db";
import { movieCategories, languages } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  ManageMoviesCategoriesClient,
  MovieCategoryItem,
} from "@/components/admin/ManageMoviesCategoriesClient";

export const dynamic = "force-dynamic";

export default async function ManageMoviesCategoriesPage() {
  const [rawCategories, rawLangs] = await Promise.all([
    db.select().from(movieCategories).orderBy(asc(movieCategories.id)),
    db.select({ name: languages.name }).from(languages),
  ]);

  // Default PlayTube languages list matching screenshot if db languages table is empty
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

  const initialCategories: MovieCategoryItem[] = rawCategories.map((c) => {
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
    <ManageMoviesCategoriesClient
      initialCategories={initialCategories}
      availableLanguages={availableLanguages}
    />
  );
}
