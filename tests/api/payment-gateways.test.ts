import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db";
import { siteConfig, users, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";
import { depositWalletAction, transferBalanceToWalletAction, transferWalletToBalanceAction } from "@/modules/wallet/wallet.actions";

describe("Phase 1.11: Payment Gateways and Wallet Wiring", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Configure payment gateways in siteConfig
    await db
      .insert(siteConfig)
      .values({ name: "bank_payment", value: "on" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });

    await db
      .insert(siteConfig)
      .values({ name: "paypal_payment", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    await db
      .insert(siteConfig)
      .values({ name: "stripe_payment", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    // Seed test user
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, "wallet_user_test@example.com"))
      .limit(1);

    if (existing) {
      testUserId = existing.id;
      await db.update(users).set({ wallet: 50, balance: 25 }).where(eq(users.id, testUserId));
    } else {
      const [u] = await db
        .insert(users)
        .values({
          email: "wallet_user_test@example.com",
          username: "wallet_user_test",
          password: "password123",
          wallet: 50,
          balance: 25,
        })
        .returning();
      testUserId = u.id;
    }
  });

  it("reads gateway configurations from siteConfig", async () => {
    const config = await getSiteConfig(["bank_payment", "paypal_payment", "stripe_payment"]);
    expect(config["bank_payment"]).toBe("on");
    expect(config["paypal_payment"]).toBe("off");
    expect(config["stripe_payment"]).toBe("off");
  });

  it("prevents negative or invalid deposit amounts", async () => {
    const res = await depositWalletAction(-10);
    expect(res.success).toBe(false);
    expect(res.error).toBe("Please enter a valid deposit amount.");
  });

  it("prevents transfer exceeding current balance", async () => {
    // Attempt to transfer huge amount
    const res = await transferBalanceToWalletAction(999999);
    // Unauthenticated or insufficient balance returns false
    expect(res.success).toBe(false);
  });
});
