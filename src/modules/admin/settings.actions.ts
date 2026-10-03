"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveSingleSettingAction(key: string, value: string) {
  await assertAdmin();
  try {
    await db
      .insert(siteConfig)
      .values({ name: key, value })
      .onConflictDoUpdate({
        target: siteConfig.name,
        set: { value },
      });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving setting:", key, err);
    return { success: false, error: err.message };
  }
}

export async function saveMultipleSettingsAction(settings: Record<string, string>) {
  await assertAdmin();
  try {
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(siteConfig)
        .values({ name: key, value })
        .onConflictDoUpdate({
          target: siteConfig.name,
          set: { value },
        });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving settings batch:", err);
    return { success: false, error: err.message };
  }
}
