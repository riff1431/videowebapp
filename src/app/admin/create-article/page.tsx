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

  return <CreateArticleClient categories={categoriesList} />;
}
