import React from "react";
import { db } from "@/db";
import { monetizationRequests, users } from "@/db/schema";
import { ManageMonetizationRequestsClient } from "@/components/admin/ManageMonetizationRequestsClient";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminMonetizationRequestsPage() {
  const reqs = await db
    .select({
      id: monetizationRequests.id,
      status: monetizationRequests.status,
      createdAt: monetizationRequests.createdAt,
      username: users.username,
      avatar: users.avatar,
    })
    .from(monetizationRequests)
    .innerJoin(users, eq(monetizationRequests.userId, users.id))
    .orderBy(desc(monetizationRequests.id));

  const formatted = reqs.map((r) => ({
    id: r.id,
    username: r.username,
    avatar: r.avatar,
    status: r.status,
    createdAt: new Date(r.createdAt).toLocaleDateString(),
  }));

  return <ManageMonetizationRequestsClient initialRequests={formatted} />;
}
