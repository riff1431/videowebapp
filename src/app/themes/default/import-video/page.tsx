import { requireAuth } from "@/lib/auth/require-auth";
import ImportVideoClient from "./ImportVideoClient";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function ImportVideoPage() {
  await requireAuth("/import-video");
  const allCategories = await db
    .select({
      id: categories.id,
      key: categories.key,
      name: categories.name,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return <ImportVideoClient categoriesList={allCategories} />;
}

