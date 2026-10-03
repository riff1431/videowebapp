import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db";
import { users, siteConfig, videos, comments, likesDislikes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { awardUserPoints } from "@/services/points.service";
import { getSiteConfig } from "@/lib/config";

describe("Phase 1.7: Points System and Gated Features", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Upsert a test user
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, "points_test_user@example.com"))
      .limit(1);

    if (existing) {
      testUserId = existing.id;
      await db.update(users).set({ points: 0, isPro: false }).where(eq(users.id, testUserId));
    } else {
      const [created] = await db
        .insert(users)
        .values({
          email: "points_test_user@example.com",
          username: "points_test_user",
          password: "password123",
          points: 0,
          isPro: false,
        })
        .returning();
      testUserId = created.id;
    }
  });

  it("does not award points when point_level_system is off", async () => {
    // Disable point system in siteConfig
    await db
      .insert(siteConfig)
      .values({ name: "point_level_system", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    const result = await awardUserPoints(testUserId, "comment");
    expect(result.awarded).toBe(false);
    expect(result.pointsAdded).toBe(0);

    const [u] = await db.select().from(users).where(eq(users.id, testUserId));
    expect(u.points).toBe(0);
  });

  it("awards configured points for comment and like when point_level_system is on", async () => {
    // Enable point system and set values
    await db
      .insert(siteConfig)
      .values({ name: "point_level_system", value: "on" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });

    await db
      .insert(siteConfig)
      .values({ name: "comments_point", value: "15" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "15" } });

    await db
      .insert(siteConfig)
      .values({ name: "likes_point", value: "7" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "7" } });

    // Award comment points
    const commentRes = await awardUserPoints(testUserId, "comment");
    expect(commentRes.awarded).toBe(true);
    expect(commentRes.pointsAdded).toBe(15);

    let [u] = await db.select().from(users).where(eq(users.id, testUserId));
    expect(u.points).toBe(15);

    // Award like points
    const likeRes = await awardUserPoints(testUserId, "like");
    expect(likeRes.awarded).toBe(true);
    expect(likeRes.pointsAdded).toBe(7);

    [u] = await db.select().from(users).where(eq(users.id, testUserId));
    expect(u.points).toBe(22);
  });

  it("restricts point earning when who_can_point is set to pro and user is not pro", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "who_can_point", value: "pro" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "pro" } });

    const result = await awardUserPoints(testUserId, "upload");
    expect(result.awarded).toBe(false);
    expect(result.pointsAdded).toBe(0);

    // Turn back to 'all'
    await db
      .insert(siteConfig)
      .values({ name: "who_can_point", value: "all" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "all" } });
  });

  it("respects popular_channels and switch_account config toggles", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "popular_channels", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    await db
      .insert(siteConfig)
      .values({ name: "switch_account", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    const config = await getSiteConfig(["popular_channels", "switch_account"]);
    expect(config["popular_channels"]).toBe("off");
    expect(config["switch_account"]).toBe("off");
  });
});
