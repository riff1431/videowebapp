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

  const availableCategories = rawCategories;

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
