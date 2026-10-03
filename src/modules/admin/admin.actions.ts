"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { siteConfig, videos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateAdminSettingsAction(formData: FormData) {
  await assertAdmin();
  try {
    for (const [key, val] of formData.entries()) {
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

    try {
      revalidateTag("site-config");
    } catch {}

    revalidatePath("/admin/settings");
    revalidatePath("/admin/ads");
    revalidatePath("/admin/pro-settings");
    revalidatePath("/admin/payment-settings");
    revalidatePath("/admin/email-settings");
    revalidatePath("/admin/ffmpeg");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteVideoAdminAction(videoId: string) {
  await assertAdmin();
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
  await assertAdmin();
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
