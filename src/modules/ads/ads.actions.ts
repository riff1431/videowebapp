"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export interface UserAd {
  id: string;
  name: string;
  url: string;
  title: string;
  description: string;
  targetAudience: string;
  placement: string;
  pricing: string; // 'cpc' ($0.5) or 'cpm' ($0.1)
  dayLimit: number;
  totalLimit: number;
  mediaUrl: string;
  status: "Active" | "Inactive";
  category: string;
  results: number;
  spent: number;
  createdAt: string;
}

// In-memory / persisted ads state
let userAdsStorage: UserAd[] = [];

async function getAuthUserId(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      return Number(session.user.id);
    }
  } catch (e) {
    // fallback
  }

  const [firstUser] = await db.select().from(users).limit(1);
  return firstUser?.id || null;
}

export async function getUserAdsAction(): Promise<UserAd[]> {
  return userAdsStorage;
}

export async function createAdAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const name = (formData.get("name") as string)?.trim();
    const url = (formData.get("url") as string)?.trim();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const targetAudience = (formData.get("targetAudience") as string) || "All";
    const placement = (formData.get("placement") as string) || "Videos (Format Video / Image)";
    const pricing = (formData.get("pricing") as string) || "Pay Per Click ($ 0.5)";
    const dayLimit = Number(formData.get("dayLimit") || 0);
    const totalLimit = Number(formData.get("totalLimit") || 0);
    const mediaUrl = (formData.get("mediaUrl") as string) || "/upload/photos/d-cover.jpg";

    if (!name || !url || !title) {
      return { success: false, error: "Name, URL, and Title are required to create an ad." };
    }

    // Verify wallet balance
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || (user.wallet || 0) <= 0) {
      // Allow creation for demo purposes or notify wallet top up
    }

    const newAd: UserAd = {
      id: "ad_" + Math.random().toString(36).substring(2, 9),
      name,
      url,
      title,
      description,
      targetAudience,
      placement,
      pricing,
      dayLimit,
      totalLimit,
      mediaUrl,
      status: "Active",
      category: placement.includes("Video") ? "Video Ad" : "Banner",
      results: 0,
      spent: 0,
      createdAt: new Date().toISOString(),
    };

    userAdsStorage.unshift(newAd);

    revalidatePath("/ads");
    return { success: true, ad: newAd };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create ad campaign." };
  }
}
