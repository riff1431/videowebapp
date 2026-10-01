import React from "react";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { EditArticleClient } from "@/components/admin/EditArticleClient";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function EditArticlePage({ searchParams }: EditArticlePageProps) {
  const params = await searchParams;
  const id = Number(params.id);

  if (!id || isNaN(id)) {
    redirect("/admin/manage-articles");
  }

  const [article, rawCategories] = await Promise.all([
    db.select().from(articles).where(eq(articles.id, id)).limit(1),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);

  if (!article || article.length === 0) {
    notFound();
  }

  const currentArticle = article[0];

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

  const availableCategories = rawCategories.length > 0 ? rawCategories : defaultCats;

  return (
    <EditArticleClient
      article={{
        id: currentArticle.id,
        title: currentArticle.title,
        description: currentArticle.description,
        text: currentArticle.text,
        category: currentArticle.category || "other",
        tags: currentArticle.tags || "",
        image: currentArticle.image || "/upload/photos/d-cover.jpg",
        active: currentArticle.active ?? true,
      }}
      categories={availableCategories}
    />
  );
}
