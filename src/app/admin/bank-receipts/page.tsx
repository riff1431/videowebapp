import React from "react";
import { db } from "@/db";
import { bankReceipts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BankReceiptsClient } from "@/components/admin/BankReceiptsClient";

export const dynamic = "force-dynamic";

export default async function AdminBankReceiptsPage() {
  const rows = await db
    .select({
      id: bankReceipts.id,
      userId: bankReceipts.userId,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatar,
      receiptImg: bankReceipts.receiptImg,
      price: bankReceipts.price,
      mode: bankReceipts.mode,
      status: bankReceipts.status,
      createdAt: bankReceipts.createdAt,
    })
    .from(bankReceipts)
    .leftJoin(users, eq(bankReceipts.userId, users.id))
    .orderBy(desc(bankReceipts.createdAt));

  const receipts = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName || r.userUsername || "Unknown User",
    userAvatar: r.userAvatar || "/upload/photos/d-avatar.jpg",
    receiptImg: r.receiptImg,
    price: r.price,
    mode: r.mode || "wallet",
    status: r.status ?? 0,
    createdAt: r.createdAt.toISOString(),
  }));

  const approvedCount = receipts.filter((r) => r.status === 1).length;
  const disapprovedCount = receipts.filter((r) => r.status === 2).length;

  return (
    <BankReceiptsClient
      receipts={receipts}
      approvedCount={approvedCount}
      disapprovedCount={disapprovedCount}
    />
  );
}
