import React from "react";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/require-auth";
import { WalletClient } from "./WalletClient";

import { getSiteConfig } from "@/lib/config";

export const metadata = {
  title: "Wallet - PlayTube",
  description: "Manage your PlayTube wallet, balance, and transactions.",
};

export const revalidate = 0; // Dynamic wallet data

export default async function WalletPage() {
  const session = await requireAuth("/wallet");
  const userId = Number(session.user.id);

  // Fetch live user wallet and creator balance
  const [currentUser] = await db
    .select({
      id: users.id,
      wallet: users.wallet,
      balance: users.balance,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Fetch recent transactions for this user
  const userTransactions = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      description: transactions.description,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(20);

  const config = await getSiteConfig(["paypal_payment", "stripe_payment", "bank_payment"]);

  return (
    <WalletClient
      initialWallet={currentUser?.wallet || 0}
      initialBalance={currentUser?.balance || 0}
      transactions={userTransactions}
      paymentGateways={{
        paypal: config["paypal_payment"] === "on" || config["paypal_payment"] === "1",
        stripe: config["stripe_payment"] === "on" || config["stripe_payment"] === "1",
        bank: config["bank_payment"] === "on" || config["bank_payment"] === "1",
      }}
    />
  );
}
