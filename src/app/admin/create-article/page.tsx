import React from "react";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { CreateArticleClient } from "@/components/admin/CreateArticleClient";

export const dynamic = "force-dynamic";

export default async function CreateArticlePage() {
  const categoriesList = await db
    .select({
      id: categories.id,
      key: categories.key,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  // Fallback categories if empty in database
  const defaultCats = [
    { id: 1, key: "film_animation", name: "Film & Animation" },
    { id: 2, key: "music", name: "Music" },
    { id: 3, key: "gaming", name: "Gaming" },
    { id: 4, key: "entertainment", name: "Entertainment" },
    { id: 5, key: "news_politics", name: "News & Politics" },
    { id: 6, key: "education", name: "Education" },
    { id: 7, key: "technology", name: "Technology" },
    { id: 8, key: "other", name: "Other" },
  ];

  const availableCategories = categoriesList.length > 0 ? categoriesList : defaultCats;

  return <CreateArticleClient categories={availableCategories} />;
}
