"use server";

import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function depositWalletAction(amount: number) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid deposit amount." };
    }

    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required" };
    }

    const newWallet = (user.wallet || 0) + amount;

    await db
      .update(users)
      .set({ wallet: newWallet })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "deposit",
      amount,
      currency: "USD",
      status: "completed",
      description: `Wallet top-up via Payment Gateway ($${amount})`,
    });

    revalidatePath("/wallet");
    return { success: true, balance: newWallet };
  } catch (err: any) {
    return { success: false, error: err.message || "Deposit transaction failed." };
  }
}

export async function requestWithdrawalAction(amount: number, paypalEmail: string) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid amount." };
    }

    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required" };
    }

    if ((user.balance || 0) < amount) {
      return { success: false, error: "Insufficient creator balance for withdrawal." };
    }

    const newBalance = (user.balance || 0) - amount;

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "withdraw",
      amount,
      currency: "USD",
      status: "pending",
      description: `Withdrawal request to ${paypalEmail} ($${amount})`,
    });

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Withdrawal request failed." };
  }
}

export async function upgradeToProAction(planName: string, price: number) {
  try {
    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required" };
    }

    if ((user.wallet || 0) < price) {
      return {
        success: false,
        error: `Insufficient wallet balance ($${user.wallet || 0}). Please replenish your wallet first.`,
      };
    }

    const newWallet = (user.wallet || 0) - price;

    await db
      .update(users)
      .set({
        wallet: newWallet,
        isPro: true,
        verified: true,
      })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "pro_pkg",
      amount: price,
      currency: "USD",
      status: "completed",
      description: `Upgraded to PlayTube ${planName} Membership`,
    });

    revalidatePath("/go-pro");
    revalidatePath("/wallet");
    revalidatePath("/settings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Upgrade failed." };
  }
}
