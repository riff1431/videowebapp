"use server";

import { db } from "@/db";
import { bankReceipts, users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveBankReceiptAction(receiptId: number) {
  try {
    const [receipt] = await db
      .select()
      .from(bankReceipts)
      .where(eq(bankReceipts.id, receiptId))
      .limit(1);

    if (!receipt) {
      return { success: false, error: "Receipt not found" };
    }

    // Update receipt status to 1 (approved)
    await db
      .update(bankReceipts)
      .set({ status: 1, approvedAt: new Date() })
      .where(eq(bankReceipts.id, receiptId));

    // Credit user's wallet
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, receipt.userId))
      .limit(1);

    if (user) {
      const newWallet = (user.wallet || 0) + Number(receipt.price || 0);
      await db
        .update(users)
        .set({ wallet: newWallet })
        .where(eq(users.id, user.id));

      // Record transaction
      await db.insert(transactions).values({
        userId: user.id,
        type: "bank_deposit",
        amount: Number(receipt.price || 0),
        status: "completed",
        description: `Bank transfer approved (Receipt #${receiptId})`,
      });
    }

    revalidatePath("/admin/bank-receipts");
    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve receipt" };
  }
}

export async function declineBankReceiptAction(receiptId: number) {
  try {
    await db
      .update(bankReceipts)
      .set({ status: 2, approvedAt: new Date() })
      .where(eq(bankReceipts.id, receiptId));

    revalidatePath("/admin/bank-receipts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to decline receipt" };
  }
}

export async function deleteBankReceiptAction(receiptId: number) {
  try {
    await db.delete(bankReceipts).where(eq(bankReceipts.id, receiptId));
    revalidatePath("/admin/bank-receipts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete receipt" };
  }
}
