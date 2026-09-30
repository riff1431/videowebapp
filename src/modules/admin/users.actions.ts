"use server";

import { db } from "@/db";
import { users, customProfileFields, verificationRequests, monetizationRequests, siteConfig } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ========================
// 1. Manage Users Actions
// ========================
export async function bulkUserAction(userIds: number[], action: "activate" | "deactivate" | "delete") {
  try {
    if (!userIds || userIds.length === 0) {
      return { success: false, error: "No users selected" };
    }

    if (action === "activate") {
      await db.update(users).set({ active: true }).where(inArray(users.id, userIds));
    } else if (action === "deactivate") {
      await db.update(users).set({ active: false }).where(inArray(users.id, userIds));
    } else if (action === "delete") {
      await db.delete(users).where(inArray(users.id, userIds));
    }

    revalidatePath("/admin/manage-users");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to perform user action" };
  }
}

export async function deleteSingleUserAction(userId: number) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/manage-users");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user" };
  }
}

// ========================
// 2. Affiliates Settings Actions
// ========================
export async function updateAffiliatesSettingsAction(formData: FormData) {
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

    revalidatePath("/admin/affiliates-settings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update affiliate settings" };
  }
}

// ========================
// 3. Custom Profile Fields Actions
// ========================
export async function createCustomProfileFieldAction(formData: FormData) {
  try {
    const fieldType = (formData.get("fieldType") as string) || "textbox";
    const fieldName = (formData.get("fieldName") as string)?.trim();
    const fieldLength = Number(formData.get("fieldLength") || 32);
    const fieldDescription = (formData.get("fieldDescription") as string) || "";
    const placement = (formData.get("placement") as string) || "general";
    const showOnRegistration = formData.get("showOnRegistration") === "yes";
    const showOnProfile = formData.get("showOnProfile") === "yes";

    if (!fieldName) {
      return { success: false, error: "Field Name is required" };
    }

    await db.insert(customProfileFields).values({
      fieldType,
      fieldName,
      fieldLength,
      fieldDescription,
      placement,
      showOnRegistration,
      showOnProfile,
    });

    revalidatePath("/admin/manage-profile-fields");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create profile field" };
  }
}

export async function deleteCustomProfileFieldsAction(ids: number[]) {
  try {
    if (ids.length > 0) {
      await db.delete(customProfileFields).where(inArray(customProfileFields.id, ids));
    }
    revalidatePath("/admin/manage-profile-fields");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete profile fields" };
  }
}

// ========================
// 4. Verification Requests Actions
// ========================
export async function bulkVerificationRequestAction(requestIds: number[], action: "verify" | "delete") {
  try {
    if (!requestIds || requestIds.length === 0) return { success: false, error: "No items selected" };

    if (action === "verify") {
      const reqs = await db.select().from(verificationRequests).where(inArray(verificationRequests.id, requestIds));
      const userIds = reqs.map((r) => r.userId);
      if (userIds.length > 0) {
        await db.update(users).set({ verified: true }).where(inArray(users.id, userIds));
      }
      await db.update(verificationRequests).set({ status: "verified" }).where(inArray(verificationRequests.id, requestIds));
    } else if (action === "delete") {
      await db.delete(verificationRequests).where(inArray(verificationRequests.id, requestIds));
    }

    revalidatePath("/admin/verification-requests");
    revalidatePath("/admin/manage-users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process verification requests" };
  }
}

// ========================
// 5. Monetization Requests Actions
// ========================
export async function bulkMonetizationRequestAction(requestIds: number[], action: "verify" | "delete") {
  try {
    if (!requestIds || requestIds.length === 0) return { success: false, error: "No items selected" };

    if (action === "verify") {
      await db.update(monetizationRequests).set({ status: "verified" }).where(inArray(monetizationRequests.id, requestIds));
    } else if (action === "delete") {
      await db.delete(monetizationRequests).where(inArray(monetizationRequests.id, requestIds));
    }

    revalidatePath("/admin/monitization-requests");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process monetization requests" };
  }
}
