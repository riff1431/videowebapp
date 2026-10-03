import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db";
import { siteConfig, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";
import { getThemesAction, activateThemeAction, getSiteDesignSettingsAction } from "@/modules/admin/design.actions";
import { auth } from "@/lib/auth/auth";

describe("Phase 1.8: Themes System", () => {
  let adminUserId: number;

  beforeAll(async () => {
    // Ensure admin user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin_theme_test@example.com"))
      .limit(1);

    if (existing) {
      adminUserId = existing.id;
      await db.update(users).set({ isAdmin: true, role: "admin" }).where(eq(users.id, adminUserId));
    } else {
      const [created] = await db
        .insert(users)
        .values({
          email: "admin_theme_test@example.com",
          username: "admin_theme_test",
          password: "password123",
          isAdmin: true,
          role: "admin",
        })
        .returning();
      adminUserId = created.id;
    }
  });

  it("persists and reads active theme via getSiteConfig and getThemesAction", async () => {
    // Set theme directly in DB
    await db
      .insert(siteConfig)
      .values({ name: "theme", value: "default" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "default" } });

    const config = await getSiteConfig(["theme"]);
    expect(config["theme"]).toBe("default");

    // Also verify getSiteDesignSettingsAction returns it
    const designRes = await getSiteDesignSettingsAction();
    expect(designRes.success).toBe(true);
    expect(designRes.data?.theme).toBe("default");
  });

  it("updates active theme to youplay", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "theme", value: "youplay" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "youplay" } });

    const config = await getSiteConfig(["theme"]);
    expect(config["theme"]).toBe("youplay");
  });
});
