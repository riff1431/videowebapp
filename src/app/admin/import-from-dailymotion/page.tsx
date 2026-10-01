import React from "react";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ImportFromDailymotionClient } from "@/components/admin/ImportFromDailymotionClient";

export const dynamic = "force-dynamic";

export default async function ImportFromDailymotionPage() {
  const cats = await db
    .select({ key: categories.key, name: categories.name })
    .from(categories);

  return <ImportFromDailymotionClient categoriesList={cats} />;
}
