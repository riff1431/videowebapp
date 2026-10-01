import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { languages, languageTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedLang = (searchParams.get("lang") || "english").toLowerCase();

    // 1. Fetch all available active languages
    const activeLanguages = await db
      .select({
        id: languages.id,
        name: languages.name,
        displayName: languages.displayName,
        iso: languages.iso,
        direction: languages.direction,
        isDefault: languages.isDefault,
      })
      .from(languages)
      .where(eq(languages.status, "active"));

    // 2. Fetch english fallback translations first
    const englishRows = await db
      .select({
        key: languageTranslations.key,
        value: languageTranslations.value,
      })
      .from(languageTranslations)
      .where(eq(languageTranslations.lang, "english"));

    const dict: Record<string, string> = {};
    for (const r of englishRows) {
      dict[r.key] = r.value;
    }

    // 3. If requested language is not english, overlay target language translations
    if (requestedLang !== "english") {
      const targetRows = await db
        .select({
          key: languageTranslations.key,
          value: languageTranslations.value,
        })
        .from(languageTranslations)
        .where(eq(languageTranslations.lang, requestedLang));

      for (const r of targetRows) {
        if (r.value) {
          dict[r.key] = r.value;
        }
      }
    }

    const currentLangMeta = activeLanguages.find((l) => l.name === requestedLang) || {
      name: requestedLang,
      displayName: requestedLang,
      iso: "en",
      direction: "ltr",
      isDefault: false,
    };

    return NextResponse.json(
      {
        lang: requestedLang,
        meta: currentLangMeta,
        languages: activeLanguages,
        translations: dict,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("Translations API error:", err);
    return NextResponse.json(
      { error: "Failed to load translations" },
      { status: 500 }
    );
  }
}
