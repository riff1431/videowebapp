"use server";

import { db } from "@/db";
import { videoAds } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createVideoAdAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const type = (formData.get("type") as string) || "video";
    const adMedia = (formData.get("adMedia") as string)?.trim();
    const adUrl = (formData.get("adUrl") as string)?.trim();
    const duration = Number(formData.get("duration") || 10);

    if (!name || !adMedia || !adUrl) {
      return { success: false, error: "Name, Media URL and Target Link are required" };
    }

    await db.insert(videoAds).values({
      name,
      type,
      adMedia,
      adUrl,
      duration,
      active: true,
    });

    revalidatePath("/admin/manage-video-ads");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create video ad" };
  }
}

export async function deleteVideoAdsAction(ids: number[]) {
  try {
    if (ids.length > 0) {
      await db.delete(videoAds).where(inArray(videoAds.id, ids));
    }
    revalidatePath("/admin/manage-video-ads");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete video ads" };
  }
}
