import React from "react";
import { db } from "@/db";
import { languages, languageTranslations, languageKeys } from "@/db/schema";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { EditLangClient } from "@/components/admin/EditLangClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditLangPageProps {
  searchParams: Promise<{
    id?: string;
    query?: string;
    page?: string;
  }>;
}

export default async function EditLangPage({ searchParams }: EditLangPageProps) {
  const params = await searchParams;
  const langName = (params.id || "").trim().toLowerCase();

  if (!langName) {
    redirect("/admin/manage-languages");
  }

  // 1. Fetch language metadata (ISO, status)
  const langRecord = await db
    .select({
      id: languages.id,
      name: languages.name,
      displayName: languages.displayName,
      iso: languages.iso,
    })
    .from(languages)
    .where(eq(languages.name, langName))
    .limit(1);

  if (langRecord.length === 0) {
    redirect("/admin/manage-languages");
  }

  const query = (params.query || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // 2. Query translations for this language with search and pagination
  let whereClause = eq(languageTranslations.lang, langName);
  if (query) {
    whereClause = and(
      eq(languageTranslations.lang, langName),
      or(
        ilike(languageTranslations.key, `%${query}%`),
        ilike(languageTranslations.value, `%${query}%`)
      )
    )!;
  }

  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(languageTranslations)
    .where(whereClause);

  const totalCount = totalCountResult?.count || 0;

  const translationRows = await db
    .select({
      id: languageTranslations.id,
      key: languageTranslations.key,
      value: languageTranslations.value,
    })
    .from(languageTranslations)
    .where(whereClause)
    .orderBy(languageTranslations.id)
    .limit(pageSize)
    .offset(offset);

  return (
    <EditLangClient
      langName={langName}
      initialIso={langRecord[0].iso}
      initialRows={translationRows}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      currentQuery={query}
    />
  );
}
