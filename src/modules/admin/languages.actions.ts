"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { languages, languageKeys } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addLanguageAction(formData: FormData) {
  await assertAdmin();
  try {
    const name = (formData.get("name") as string)?.trim();
    const iso = (formData.get("iso") as string)?.trim().toLowerCase();

    if (!name || !iso) {
      return { success: false, error: "Language name and ISO code are required" };
    }

    if (!/^[a-zA-Z]+$/.test(name)) {
      return { success: false, error: "Use only English letters, no spaces allowed for Language Name" };
    }

    // Capitalize first letter for display consistency or keep formatted
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    await db.insert(languages).values({
      name: formattedName,
      iso,
      status: "active",
    });

    revalidatePath("/admin/manage-languages");
    revalidatePath("/admin/languages");
    revalidatePath("/admin/add-language");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "23505") {
      return { success: false, error: "A language with this name already exists" };
    }
    return { success: false, error: err.message || "Failed to add language" };
  }
}

export async function addLanguageKeyAction(formData: FormData) {
  await assertAdmin();
  try {
    const keyName = (formData.get("keyName") as string)?.trim().toLowerCase();

    if (!keyName) {
      return { success: false, error: "Key name is required" };
    }

    if (!/^[a-zA-Z_]+$/.test(keyName)) {
      return { success: false, error: "Use only English letters and underscores, example: this_is_a_key" };
    }

    await db.insert(languageKeys).values({
      keyName,
    });

    revalidatePath("/admin/add-language");
    return { success: true };
  } catch (err: any) {
    if (err?.code === "23505") {
      return { success: false, error: "A key with this name already exists" };
    }
    return { success: false, error: err.message || "Failed to add key" };
  }
}

export async function toggleLanguageStatusAction(id: number, currentStatus: string) {
  await assertAdmin();
  try {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await db.update(languages).set({ status: newStatus }).where(eq(languages.id, id));

    revalidatePath("/admin/manage-languages");
    revalidatePath("/admin/languages");
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update language status" };
  }
}

export async function deleteLanguagesAction(ids: number[]) {
  await assertAdmin();
  try {
    if (ids.length > 0) {
      await db.delete(languages).where(inArray(languages.id, ids));
    }
    revalidatePath("/admin/manage-languages");
    revalidatePath("/admin/languages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete language(s)" };
  }
}

export async function updateLanguageIsoAction(langName: string, iso: string) {
  await assertAdmin();
  try {
    const cleanIso = iso.trim().toLowerCase();
    if (!cleanIso) {
      return { success: false, error: "ISO code cannot be empty" };
    }

    await db
      .update(languages)
      .set({ iso: cleanIso })
      .where(eq(languages.name, langName.toLowerCase()));

    revalidatePath("/admin/manage-languages");
    revalidatePath("/admin/edit-lang");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update ISO" };
  }
}

export async function updateLanguageTranslationAction(
  key: string,
  lang: string,
  value: string
) {
  await assertAdmin();
  try {
    const cleanKey = key.trim();
    const cleanLang = lang.trim().toLowerCase();

    const { languageTranslations } = await import("@/db/schema");

    await db
      .insert(languageTranslations)
      .values({
        key: cleanKey,
        lang: cleanLang,
        value: value,
      })
      .onConflictDoUpdate({
        target: [languageTranslations.key, languageTranslations.lang],
        set: { value: value },
      });

    revalidatePath("/admin/edit-lang");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update translation" };
  }
}

