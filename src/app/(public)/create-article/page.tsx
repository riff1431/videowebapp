import { requireAuth } from "@/lib/auth/require-auth";
import CreateArticleClient from "./CreateArticleClient";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function CreateArticlePage() {
  await requireAuth("/create-article");
  const allCategories = await db
    .select({
      id: categories.id,
      key: categories.key,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return <CreateArticleClient categoriesList={allCategories} />;
}

