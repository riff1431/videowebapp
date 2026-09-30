import React from "react";
import { db } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { PaymentRequestsClient } from "@/components/admin/PaymentRequestsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentRequestsPage() {
  const rows = await db
    .select({
      id: paymentRequests.id,
      userId: paymentRequests.userId,
      userName: users.name,
      userUsername: users.username,
      paypalEmail: paymentRequests.paypalEmail,
      amount: paymentRequests.amount,
      currency: paymentRequests.currency,
      status: paymentRequests.status,
      createdAt: paymentRequests.createdAt,
    })
    .from(paymentRequests)
    .leftJoin(users, eq(paymentRequests.userId, users.id))
    .orderBy(desc(paymentRequests.createdAt));

  const initialRequests = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName || r.userUsername || "Creator",
    paypalEmail: r.paypalEmail || "",
    amount: r.amount,
    currency: r.currency || "USD",
    status: r.status ?? 0,
    requested: r.createdAt.toLocaleDateString(),
  }));

  return <PaymentRequestsClient initialRequests={initialRequests} />;
}
