import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getUserAdsAction } from "@/modules/ads/ads.actions";
import { AdsClient } from "./AdsClient";

export const metadata = {
  title: "Advertising - PlayTube",
  description: "Create and manage your video and banner advertising campaigns.",
};

export default async function AdsPage() {
  let currentUser: any = null;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(session.user.id)))
        .limit(1);
      currentUser = u;
    }
  } catch (e) {
    // fallback
  }

  if (!currentUser) {
    const [u] = await db.select().from(users).limit(1);
    currentUser = u || { wallet: 0, balance: 0 };
  }

  const ads = await getUserAdsAction();

  return (
    <AdsClient
      wallet={currentUser?.wallet || 0}
      balance={currentUser?.balance || 0}
      ads={ads}
    />
  );
}
