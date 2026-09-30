import React from "react";
import { db } from "@/db";
import { languages } from "@/db/schema";
import { ManageLanguagesClient } from "@/components/admin/ManageLanguagesClient";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ManageLanguagesPage() {
  const allLanguages = await db
    .select({
      id: languages.id,
      name: languages.name,
      iso: languages.iso,
      status: languages.status,
    })
    .from(languages)
    .orderBy(asc(languages.id));

  return <ManageLanguagesClient initialLanguages={allLanguages} />;
}
