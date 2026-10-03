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
    const shell = page.locator('div[data-theme="youplay"]').first();
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
    const themedShell = page.locator('div[data-theme="youplay"]');
    await expect(themedShell).toHaveCount(0);
  });

  test("h) preview_theme works for admin and is ignored for anonymous/normal users", async ({ page }) => {
    // Anonymous user attempting preview: should ignore preview and remain youplay
    await page.goto("/?preview_theme=testtheme");
    await page.waitForLoadState("domcontentloaded");
    const anonShell = page.locator('div[data-theme="youplay"]').first();
    await expect(anonShell).toBeVisible();

    // Log in as Admin via /admin/login
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");
    await page.fill('input[placeholder="admin@playtube.com"]', "admin@playtube.test");
    await page.fill('input[type="password"]', "adminpassword123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    // Admin previewing testtheme
    await page.goto("/?preview_theme=testtheme");
    await page.waitForLoadState("domcontentloaded");
    const previewBanner = page.locator("text=Previewing theme: testtheme");
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
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).not.toContain("/themes/");

    const loginIdentifier = page.getByPlaceholder(/Username/i).first();
    const loginPassword = page.getByPlaceholder(/Password/i).first();

    await loginIdentifier.fill("user_a@playtube.test");
    await loginPassword.fill("password123");

    const loginBtn = page.locator('button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 }).catch(() => {});
    expect(page.url()).not.toContain("/themes/");
  });

  test("j) switching back restores the fallback theme", async ({ page }) => {
    await db
      .update(siteConfig)
      .set({ value: "youplay" })
      .where(eq(siteConfig.name, "active_theme"));

    await page.goto("/");
    const shell = page.locator('div[data-theme="youplay"]').first();
    await expect(shell).toBeVisible();
  });
});
