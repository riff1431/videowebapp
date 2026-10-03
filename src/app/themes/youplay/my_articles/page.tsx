import React from "react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/require-auth";
import { MyArticlesClient } from "./MyArticlesClient";

interface MyArticlesPageProps {
  searchParams: Promise<{ page_id?: string }>;
}

export default async function MyArticlesPage({ searchParams }: MyArticlesPageProps) {
  const { page_id } = await searchParams;
  const page = Math.max(1, parseInt(page_id || "1", 10) || 1);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const session = await requireAuth(`/my_articles?page_id=${page}`);
  const targetUserId = Number(session.user.id);

  const [[totalCountResult], userArticles] = await Promise.all([
    db
      .select({ value: count() })
      .from(articles)
      .where(eq(articles.userId, targetUserId)),
    db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        category: articles.category,
        image: articles.image,
        views: articles.views,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .where(eq(articles.userId, targetUserId))
      .orderBy(desc(articles.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  const totalCount = totalCountResult?.value || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <MyArticlesClient
      initialArticles={userArticles}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
}
