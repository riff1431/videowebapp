import { cookies } from "next/headers";
import { db } from "@/db";
import { languages, languageTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getServerTranslations() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("playtube_lang")?.value;
  const currentLang = (langCookie || "english").toLowerCase();

  // 1. Fetch active languages
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

  // 2. Fetch english fallback
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

  // 3. Overlay target language
  if (currentLang !== "english") {
    const targetRows = await db
      .select({
        key: languageTranslations.key,
        value: languageTranslations.value,
      })
      .from(languageTranslations)
      .where(eq(languageTranslations.lang, currentLang));

    for (const r of targetRows) {
      if (r.value) {
        dict[r.key] = r.value;
      }
    }
  }

  const currentMeta = activeLanguages.find((l) => l.name === currentLang) || {
    id: 1,
    name: "english",
    displayName: "English",
    iso: "en",
    direction: "ltr",
    isDefault: true,
  };

  const t = (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>
  ): string => {
    let result = dict[key] ?? fallback ?? key;
    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${pKey}}}|{${pKey}}`, "g"), String(pVal));
      }
    }
    return result;
  };

  return {
    currentLang,
    currentMeta,
    languages: activeLanguages,
    dict,
    t,
  };
}
