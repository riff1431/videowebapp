import React from "react";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { AdminArticleItem, ManageArticlesClient } from "@/components/admin/ManageArticlesClient";

export const dynamic = "force-dynamic";

export default async function ManageArticlesPage() {
  const [rawArticles, rawCategories] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        category: articles.category,
        tags: articles.tags,
        active: articles.active,
        image: articles.image,
        views: articles.views,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .orderBy(desc(articles.id))
      .limit(500),
    db.select({ key: categories.key, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
  ]);

  const categoryMap: Record<string, string> = {
    film_animation: "Film & Animation",
    music: "Music",
    gaming: "Gaming",
    entertainment: "Entertainment",
    news_politics: "News & Politics",
    education: "Education",
    technology: "Technology",
    other: "Other",
  };

  rawCategories.forEach((c) => {
    categoryMap[c.key] = c.name;
  });

  const initialArticles: AdminArticleItem[] = rawArticles.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    categoryKey: a.category || "other",
    categoryName: categoryMap[a.category || "other"] || a.category || "Other",
    tags: a.tags || "",
    active: a.active ?? true,
    image: a.image || "/upload/photos/d-cover.jpg",
    views: a.views || 0,
    createdAt: a.createdAt,
  }));

  return <ManageArticlesClient initialArticles={initialArticles} />;
}
