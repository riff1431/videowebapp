import React from "react";
import { db } from "@/db";
import { verificationRequests, users } from "@/db/schema";
import { ManageVerificationRequestsClient } from "@/components/admin/ManageVerificationRequestsClient";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminVerificationRequestsPage() {
  const reqs = await db
    .select({
      id: verificationRequests.id,
      status: verificationRequests.status,
      createdAt: verificationRequests.createdAt,
      username: users.username,
      avatar: users.avatar,
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .orderBy(desc(verificationRequests.id));

  // If no requests in db yet, let's create a pending request if users exist for realistic initial view
  const formatted = reqs.map((r) => ({
    id: r.id,
    username: r.username,
    avatar: r.avatar,
    status: r.status,
    createdAt: new Date(r.createdAt).toLocaleDateString(),
  }));

  return <ManageVerificationRequestsClient initialRequests={formatted} />;
}
