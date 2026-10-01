"use server";

import { db } from "@/db";
import { users, transactions, proPayments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

async function getAuthUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }
  return Number(session.user.id);
}

export async function depositWalletAction(amount: number) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid deposit amount." };
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
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
      description: `Replenished wallet balance ($${amount.toFixed(2)})`,
    });

    revalidatePath("/wallet");
    return { success: true, balance: newWallet };
  } catch (err: any) {
    return { success: false, error: err.message || "Deposit transaction failed." };
  }
}

export async function transferBalanceToWalletAction(amount: number) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid transfer amount." };
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const currentBalance = user.balance || 0;
    if (currentBalance < amount) {
      return {
        success: false,
        error: "You don`t have enough balance to transfer!",
      };
    }

    const newBalance = currentBalance - amount;
    const newWallet = (user.wallet || 0) + amount;

    await db
      .update(users)
      .set({
        balance: newBalance,
        wallet: newWallet,
      })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "transfer",
      amount,
      currency: "USD",
      status: "completed",
      description: `Transferred $${amount.toFixed(2)} from available balance to wallet`,
    });

    revalidatePath("/wallet");
    return {
      success: true,
      message: `Successfully transferred $${amount.toFixed(2)} to your wallet!`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to transfer balance to wallet.",
    };
  }
}

export async function transferWalletToBalanceAction(amount: number) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid transfer amount." };
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const currentWallet = user.wallet || 0;
    if (currentWallet < amount) {
      return {
        success: false,
        error: "You don`t have enough wallet balance to transfer!",
      };
    }

    const newWallet = currentWallet - amount;
    const newBalance = (user.balance || 0) + amount;

    await db
      .update(users)
      .set({
        wallet: newWallet,
        balance: newBalance,
      })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "transfer",
      amount,
      currency: "USD",
      status: "completed",
      description: `Transferred $${amount.toFixed(2)} from wallet to available balance`,
    });

    revalidatePath("/wallet");
    return {
      success: true,
      message: `Successfully transferred $${amount.toFixed(2)} to your available balance!`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to transfer wallet funds to available balance.",
    };
  }
}

export async function addCreatorEarningsAction(amount: number = 100) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const newBalance = (user.balance || 0) + amount;

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "revenue",
      amount,
      currency: "USD",
      status: "completed",
      description: `Creator video monetization earnings credited ($${amount.toFixed(2)})`,
    });

    revalidatePath("/wallet");
    return {
      success: true,
      balance: newBalance,
      message: `Credited $${amount.toFixed(2)} in video earnings to your Available Balance!`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to add earnings.",
    };
  }
}

export async function requestWithdrawalAction(amount: number, paypalEmail: string) {
  try {
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Please enter a valid amount." };
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
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
      description: `Withdrawal request to ${paypalEmail} ($${amount.toFixed(2)})`,
    });

    revalidatePath("/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Withdrawal request failed." };
  }
}

export async function upgradeToProAction(planName: string, price: number) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "User authentication required." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
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

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getFullYear()}`;
    await db.insert(proPayments).values({
      userId: user.id,
      type: `pro_${planName.toLowerCase()}`,
      amount: price,
      date: dateStr,
      expire: "month",
    });

    revalidatePath("/go-pro");
    revalidatePath("/wallet");
    revalidatePath("/settings");
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Upgrade failed." };
  }
}
