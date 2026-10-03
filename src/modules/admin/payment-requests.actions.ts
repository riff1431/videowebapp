"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { paymentRequests } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function processPaymentRequestsAction(ids: number[], action: "Paid" | "Declined" | "Delete") {
  await assertAdmin();
  try {
    if (ids.length === 0) return { success: true };

    if (action === "Paid") {
      await db
        .update(paymentRequests)
        .set({ status: 1, reviewedAt: new Date() })
        .where(inArray(paymentRequests.id, ids));
    } else if (action === "Declined") {
      await db
        .update(paymentRequests)
        .set({ status: 2, reviewedAt: new Date() })
        .where(inArray(paymentRequests.id, ids));
    } else if (action === "Delete") {
      await db.delete(paymentRequests).where(inArray(paymentRequests.id, ids));
    }

    revalidatePath("/admin/payment-requests");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process payment requests" };
  }
}
