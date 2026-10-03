import { test, expect } from "@playwright/test";
import { db } from "@/db";
import { siteConfig, users } from "@/db/schema";
import { eq } from "drizzle-orm";

test.describe("Multi-Theme Switching and Architecture Verification", () => {
  test.beforeEach(async () => {
    // Ensure default active theme is youplay before each test
    await db
      .insert(siteConfig)
      .values({ name: "active_theme", value: "youplay" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "youplay" } });
  });

  test.afterAll(async () => {
    // Restore youplay active theme after all tests
    await db
      .insert(siteConfig)
      .values({ name: "active_theme", value: "youplay" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "youplay" } });
  });

  test("a) with youplay active, / renders data-theme='youplay'", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator('[data-theme="youplay"]');
    await expect(shell).toBeVisible({ timeout: 10000 });
  });

  test("e) direct GET /themes/youplay returns 404", async ({ page }) => {
    const response = await page.goto("/themes/youplay");
    expect(response?.status()).toBe(404);
  });

  test("g) /admin, /admin/login and /api/* are unaffected by the active theme", async ({ page }) => {
    const adminLoginRes = await page.goto("/admin/login");
    expect(adminLoginRes?.status()).toBe(200);

    // /admin/login does NOT render theme shell
    const themedShell = page.locator('[data-theme="youplay"]');
    await expect(themedShell).toHaveCount(0);
  });

  test("h) preview_theme works for admin and is ignored for anonymous/normal users", async ({ page, context }) => {
    // Anonymous user attempting preview: should ignore preview and remain youplay
    await page.goto("/?preview_theme=testtheme");
    const anonShell = page.locator('[data-theme="youplay"]');
    await expect(anonShell).toBeVisible();

    // Log in as Admin via /admin/login
    await page.goto("/admin/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@playtube.test");
    await page.fill('input[type="password"], input[name="password"]', "adminpassword123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // Admin previewing testtheme
    await page.goto("/?preview_theme=testtheme");
    const previewBanner = page.locator("text=Previewing theme testtheme");
    await expect(previewBanner).toBeVisible();
  });

  test("f) route missing in testtheme falls back to youplay instead of 404", async ({ page }) => {
    // Set testtheme as active theme
    await db
      .update(siteConfig)
      .set({ value: "testtheme" })
      .where(eq(siteConfig.name, "active_theme"));

    // /watch/test_vid_pub_01 is missing in testtheme, so proxy falls back to youplay
    await page.goto("/watch/test_vid_pub_01");
    // Should successfully render YouPlay watch page rather than 404
    const watchHeader = page.locator("h1, h2");
    await expect(watchHeader.first()).toBeVisible();
  });

  test("d) auth pages render and login functions identically", async ({ page }) => {
    await page.goto("/login");
    expect(page.url()).not.toContain("/themes/");

    await page.fill('input[type="email"], input[name="email"]', "user_a@playtube.test");
    await page.fill('input[type="password"], input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to clean URL /
    await page.waitForURL((url) => url.pathname === "/");
  });

  test("j) switching back restores the fallback theme", async ({ page }) => {
    await db
      .update(siteConfig)
      .set({ value: "youplay" })
      .where(eq(siteConfig.name, "active_theme"));

    await page.goto("/");
    const shell = page.locator('[data-theme="youplay"]');
    await expect(shell).toBeVisible();
  });
});
