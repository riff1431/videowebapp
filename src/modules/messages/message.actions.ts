"use server";

import { db } from "@/db";
import { users, messages } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(toUserId: number, text: string) {
  try {
    if (!text.trim()) {
      return { success: false, error: "Message text cannot be empty." };
    }

    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required." };
    }

    const [newMsg] = await db
      .insert(messages)
      .values({
        fromId: user.id,
        toId: toUserId,
        text: text.trim(),
        seen: false,
      })
      .returning();

    revalidatePath("/messages");
    return { success: true, message: newMsg };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send message." };
  }
}

export async function clearChatAction(otherUserId: number) {
  try {
    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required." };
    }

    await db
      .delete(messages)
      .where(
        or(
          and(eq(messages.fromId, user.id), eq(messages.toId, otherUserId)),
          and(eq(messages.fromId, otherUserId), eq(messages.toId, user.id))
        )
      );

    revalidatePath("/messages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to clear chat." };
  }
}
