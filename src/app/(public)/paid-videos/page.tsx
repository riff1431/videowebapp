import React from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, videos, transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { PaidVideosClient } from "./PaidVideosClient";

export const metadata = {
  title: "Purchases - PlayTube",
  description: "View your purchased and rented videos and movies.",
};

export default async function PaidVideosPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentTab = resolvedParams.tab as any;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id ? Number(session.user.id) : null;

  // Query completed user purchase / rent transactions
  const userTransactions = userId
    ? await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.status, "completed")
          )
        )
        .orderBy(desc(transactions.createdAt))
    : [];

  const purchasedVideos: any[] = [];
  const purchasedMovies: any[] = [];
  const rentedMovies: any[] = [];
  const rentedVideos: any[] = [];

  return (
    <PaidVideosClient
      purchasedVideos={purchasedVideos}
      purchasedMovies={purchasedMovies}
      rentedMovies={rentedMovies}
      rentedVideos={rentedVideos}
      initialTab={currentTab || "videos"}
    />
  );
}
