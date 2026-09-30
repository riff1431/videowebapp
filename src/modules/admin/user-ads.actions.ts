"use server";

import { db } from "@/db";
import { userAds } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteUserAdsAction(ids: number[]) {
  try {
    if (ids.length > 0) {
      await db.delete(userAds).where(inArray(userAds.id, ids));
    }
    revalidatePath("/admin/manage-user-ads");
    revalidatePath("/ads");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user ads" };
  }
}
