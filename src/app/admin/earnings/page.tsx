import React from "react";
import { db } from "@/db";
import { transactions, userAds } from "@/db/schema";
import { sql } from "drizzle-orm";
import { EarningsClient } from "@/components/admin/EarningsClient";

export const dynamic = "force-dynamic";

export default async function AdminEarningsPage() {
  const [transSum] = await db
    .select({
      total: sql<number>`COALESCE(SUM(amount), 0)`,
    })
    .from(transactions);

  const [adsSum] = await db
    .select({
      totalSpent: sql<number>`COALESCE(SUM(spent), 0)`,
    })
    .from(userAds);

  const totalRaw = Number(transSum?.total || 0) + Number(adsSum?.totalSpent || 0);
  const commission = totalRaw * 0.1; // 10% platform commission

  const stats = {
    totalWithComm: totalRaw,
    totalWithoutComm: Math.max(0, totalRaw - commission),
    totalCommission: commission,
    todayEarnings: 0,
    monthEarnings: totalRaw * 0.4,
    yearEarnings: totalRaw,
  };

  return <EarningsClient stats={stats} />;
}
