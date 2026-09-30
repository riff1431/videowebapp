"use server";

import { db } from "@/db";
import { activities, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function createActivityPostAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to publish a post." };
    }

    const userId = Number(session.user.id);
    const text = ((formData.get("text") as string) || "").trim();
    const image = ((formData.get("image") as string) || "").trim();

    if (!text && !image) {
      return {
        success: false,
        error: "Please write a message or select an image for your post.",
      };
    }

    const [newPost] = await db
      .insert(activities)
      .values({
        userId,
        type: "post",
        text: text || null,
        image: image || null,
      })
      .returning();

    const username = session.user.username || "admin";
    revalidatePath(`/channel/${username}`);
    revalidatePath(`/@${username}`);

    return {
      success: true,
      username,
      post: newPost,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to publish post. Please try again.",
    };
  }
}
