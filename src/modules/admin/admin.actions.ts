"use server";

import { db } from "@/db";
import { siteConfig, videos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAdminSettingsAction(formData: FormData) {
  try {
    const keys = [
      "title",
      "name",
      "email",
      "keyword",
      "description",
      "user_registration",
      "validation",
      "delete_account",
      "history_system",
      "article_system",
      "popular_channels",
      "max_upload",
    ];

    for (const key of keys) {
      const val = formData.get(key);
      if (typeof val === "string") {
        await db
          .insert(siteConfig)
          .values({ name: key, value: val })
          .onConflictDoUpdate({
            target: siteConfig.name,
            set: { value: val },
          });
      }
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteVideoAdminAction(videoId: string) {
  try {
    await db.delete(videos).where(eq(videos.videoId, videoId));
    revalidatePath("/admin/videos");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleUserVerificationAction(userId: number, currentStatus: boolean) {
  try {
    await db
      .update(users)
      .set({ verified: !currentStatus })
      .where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
