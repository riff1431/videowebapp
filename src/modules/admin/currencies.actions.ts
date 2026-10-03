"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { currencies } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addCurrencyAction(formData: FormData) {
  await assertAdmin();
  try {
    const currencyCode = (formData.get("currencyCode") as string)?.trim().toUpperCase();
    const currencySymbol = (formData.get("currencySymbol") as string)?.trim();

    if (!currencyCode || !currencySymbol) {
      return { success: false, error: "Currency Code and Symbol are required" };
    }

    await db
      .insert(currencies)
      .values({
        currencyCode,
        currencySymbol,
        isDefault: false,
      })
      .onConflictDoUpdate({
        target: currencies.currencyCode,
        set: { currencySymbol },
      });

    revalidatePath("/admin/manage-currencies");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add currency" };
  }
}

export async function setDefaultCurrencyAction(currencyId: number) {
  await assertAdmin();
  try {
    // Unset current default
    await db.update(currencies).set({ isDefault: false });
    // Set new default
    await db
      .update(currencies)
      .set({ isDefault: true })
      .where(eq(currencies.id, currencyId));

    revalidatePath("/admin/manage-currencies");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to set default currency" };
  }
}

export async function deleteCurrenciesAction(ids: number[]) {
  await assertAdmin();
  try {
    if (ids.length > 0) {
      await db.delete(currencies).where(inArray(currencies.id, ids));
    }
    revalidatePath("/admin/manage-currencies");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete currency" };
  }
}
