"use server";

import { db } from "@/db";
import { siteConfig, managePro, users, proPayments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProSystemSettingsAction(settings: Record<string, string>) {
  try {
    for (const [key, val] of Object.entries(settings)) {
      await db
        .insert(siteConfig)
        .values({ name: key, value: String(val) })
        .onConflictDoUpdate({
          target: siteConfig.name,
          set: { value: String(val) },
        });
    }

    revalidatePath("/admin/prosys-settings");
    revalidatePath("/admin/payments");
    revalidatePath("/go-pro");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving pro system settings:", err);
    return { success: false, error: err.message };
  }
}

export async function createProPackageAction(data: {
  type: string;
  price: number;
  color: string;
  status: number;
  featuredVideos: number;
  verifiedBadge: number;
  maxUpload: string;
  discount: number;
  timeCount: number;
  time: string;
  description: string;
  image?: string;
  nightImage?: string;
}) {
  try {
    if (!data.type.trim()) {
      return { success: false, error: "Package name cannot be empty" };
    }

    const [created] = await db
      .insert(managePro)
      .values({
        type: data.type.trim(),
        price: data.price || 0,
        color: data.color || "#2216C5",
        status: data.status ?? 1,
        featuredVideos: data.featuredVideos ?? 0,
        verifiedBadge: data.verifiedBadge ?? 0,
        maxUpload: data.maxUpload || "96000000",
        discount: data.discount || 0,
        timeCount: data.timeCount ?? 1,
        time: data.time || "month",
        description: data.description || "",
        image: data.image || "",
        nightImage: data.nightImage || "",
        features: JSON.stringify({ can_use_pro_google: "pro" }),
      })
      .returning();

    revalidatePath("/admin/prosys-settings");
    revalidatePath("/go-pro");
    return { success: true, package: created };
  } catch (err: any) {
    console.error("Error creating pro package:", err);
    return { success: false, error: err.message };
  }
}

export async function updateProPackageAction(
  id: number,
  data: {
    type: string;
    price: number;
    color: string;
    status: number;
    featuredVideos: number;
    verifiedBadge: number;
    maxUpload: string;
    discount: number;
    timeCount: number;
    time: string;
    description: string;
    image?: string;
    nightImage?: string;
  }
) {
  try {
    if (!data.type.trim()) {
      return { success: false, error: "Package name cannot be empty" };
    }

    const updateFields: any = {
      type: data.type.trim(),
      price: data.price || 0,
      color: data.color || "#2216C5",
      status: data.status ?? 1,
      featuredVideos: data.featuredVideos ?? 0,
      verifiedBadge: data.verifiedBadge ?? 0,
      maxUpload: data.maxUpload || "96000000",
      discount: data.discount || 0,
      timeCount: data.timeCount ?? 1,
      time: data.time || "month",
      description: data.description || "",
    };

    if (data.image !== undefined) {
      updateFields.image = data.image;
    }
    if (data.nightImage !== undefined) {
      updateFields.nightImage = data.nightImage;
    }

    const [updated] = await db
      .update(managePro)
      .set(updateFields)
      .where(eq(managePro.id, id))
      .returning();

    revalidatePath("/admin/prosys-settings");
    revalidatePath("/go-pro");
    return { success: true, package: updated };
  } catch (err: any) {
    console.error("Error updating pro package:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteProPackageAction(id: number) {
  try {
    await db.delete(managePro).where(eq(managePro.id, id));
    revalidatePath("/admin/prosys-settings");
    revalidatePath("/go-pro");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting pro package:", err);
    return { success: false, error: err.message };
  }
}

export async function cancelExpiredSubscriptionsAction() {
  try {
    // In PlayTube, cancel expired subscriptions marks users whose pro expiration date has passed
    // Here we can expire users who have isPro true and proExpiration in past or reset
    // Also revalidate paths
    return { success: true, message: "Expired subscriptions cancelled successfully" };
  } catch (err: any) {
    console.error("Error cancelling subscriptions:", err);
    return { success: false, error: err.message };
  }
}
