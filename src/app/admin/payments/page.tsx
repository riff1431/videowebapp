import React from "react";
import { db } from "@/db";
import { proPayments } from "@/db/schema";
import { sql } from "drizzle-orm";
import { RecentPaymentsClient } from "@/components/admin/RecentPaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  const currentMonthStr = `${currentMonth}/${currentYear}`;

  let allPayments: Array<{ amount: number; date: string }> = [];

  try {
    allPayments = await db
      .select({
        amount: proPayments.amount,
        date: proPayments.date,
      })
      .from(proPayments);
  } catch (err) {
    console.error("Failed to fetch payments:", err);
  }

  const totalEarnings = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const paidSales = allPayments.length;
  const earningsThisMonth = allPayments
    .filter((p) => p.date === currentMonthStr)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Group sales count by month for current year
  const monthlyStats = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const datePattern = `${monthNum}/${currentYear}`;
    const count = allPayments.filter((p) => p.date === datePattern).length;
    return {
      month: name,
      sales: count,
    };
  });

  return (
    <RecentPaymentsClient
      totalEarnings={totalEarnings}
      paidSales={paidSales}
      earningsThisMonth={earningsThisMonth}
      monthlyStats={monthlyStats}
    />
  );
}
