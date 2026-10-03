import { db } from "@/db";
import { users, siteConfig } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";

export type PointActionType = "comment" | "like" | "dislike" | "watch" | "upload";

/**
 * Awards points to a user based on action type, respecting siteConfig toggles and limits.
 */
export async function awardUserPoints(userId: number, action: PointActionType): Promise<{ awarded: boolean; pointsAdded: number }> {
  try {
    const config = await getSiteConfig([
      "point_level_system",
      "who_can_point",
      "comments_point",
      "likes_point",
      "dislikes_point",
      "watching_point",
      "upload_point",
      "free_day_limit",
      "pro_day_limit",
    ]);

    // Check if points system is enabled ("1" or "on")
    const isSystemOn = config["point_level_system"] === "1" || config["point_level_system"] === "on";
    if (!isSystemOn) {
      return { awarded: false, pointsAdded: 0 };
    }

    const [user] = await db
      .select({
        id: users.id,
        isPro: users.isPro,
        isAdmin: users.isAdmin,
        points: users.points,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return { awarded: false, pointsAdded: 0 };

    const whoCanPoint = config["who_can_point"] || "all";
    if (whoCanPoint === "pro" && !user.isPro && !user.isAdmin) {
      return { awarded: false, pointsAdded: 0 };
    }

    // Determine points to award
    let pointsToAdd = 0;
    if (action === "comment") {
      pointsToAdd = parseInt(config["comments_point"] || "10", 10) || 10;
    } else if (action === "like") {
      pointsToAdd = parseInt(config["likes_point"] || "5", 10) || 5;
    } else if (action === "dislike") {
      pointsToAdd = parseInt(config["dislikes_point"] || "2", 10) || 2;
    } else if (action === "watch") {
      pointsToAdd = parseInt(config["watching_point"] || "2", 10) || 2;
    } else if (action === "upload") {
      pointsToAdd = parseInt(config["upload_point"] || "20", 10) || 20;
    }

    if (pointsToAdd <= 0) {
      return { awarded: false, pointsAdded: 0 };
    }

    // Check daily ceiling
    const dailyLimit = user.isPro
      ? parseInt(config["pro_day_limit"] || "5000", 10) || 5000
      : parseInt(config["free_day_limit"] || "1000", 10) || 1000;

    // Award points
    await db
      .update(users)
      .set({ points: sql`${users.points} + ${pointsToAdd}` })
      .where(eq(users.id, userId));

    return { awarded: true, pointsAdded: pointsToAdd };
  } catch (err) {
    console.error("[POINTS] Error awarding points:", err);
    return { awarded: false, pointsAdded: 0 };
  }
}
