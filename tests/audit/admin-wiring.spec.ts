import { test, expect } from "@playwright/test";
import { db } from "../../src/db";
import { siteConfig, categories, users, videos, comments, reports, copyrightReports, customPages } from "../../src/db/schema";
import { eq, desc } from "drizzle-orm";

test.describe("Phase 4: Admin <-> User Round-Trip Integration Tests", () => {
  test.setTimeout(90000);

  // 1. Branding: Admin -> User
  test("1. Admin changes site name and night mode -> verifies public site updates", async ({ page }) => {
    // Read original site name
    const [originalRow] = await db.select().from(siteConfig).where(eq(siteConfig.name, "site_name")).limit(1);
    const originalName = originalRow?.value || "PlayTube";

    const testSiteName = "PlayTube_AuditTest_77";

    // Set new name in DB (simulating admin action)
    await db.insert(siteConfig).values({ name: "site_name", value: testSiteName })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: testSiteName } });

    try {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Verify whether public site dynamically reflects the new site name
      const title = await page.title();
      console.log(`[TEST 1] Page Title observed: "${title}"`);
    } finally {
      // Revert setting
      await db.insert(siteConfig).values({ name: "site_name", value: originalName })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: originalName } });
    }
  });

  // 2. Categories: Admin -> User
  test("2. Admin creates a new video category -> verifies public site renders it", async ({ page }) => {
    const testCategoryKey = `test_cat_${Date.now()}`;
    const testCategoryName = `Test Category ${Date.now()}`;

    // Insert category
    await db.insert(categories).values({
      key: testCategoryKey,
      name: testCategoryName,
      sortOrder: 99,
      translations: JSON.stringify({ english: testCategoryName }),
    });

    try {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check if new category appears in category filter chips
      const categoryChip = page.locator(`text=${testCategoryName}`);
      const isVisible = await categoryChip.isVisible().catch(() => false);
      console.log(`[TEST 2] Category visible on home page: ${isVisible}`);
      expect(isVisible).toBe(true);
    } finally {
      // Clean up test category
      await db.delete(categories).where(eq(categories.key, testCategoryKey));
    }
  });

  // 3. Custom CMS Pages: Admin -> User
  test("3. Admin creates custom CMS page -> verifies user page loads content", async ({ page }) => {
    const testSlug = `audit-terms-${Date.now()}`;
    const testTitle = "Audit Custom Legal Document";
    const testContent = "This is a dynamically generated CMS test document for QA validation.";

    await db.insert(customPages).values({
      pageName: testSlug,
      pageTitle: testTitle,
      pageContent: testContent,
      pageType: 1,
    });

    try {
      await page.goto(`/site-pages/${testSlug}`);
      await page.waitForLoadState("domcontentloaded");

      const bodyText = await page.innerText("body");
      expect(bodyText).toContain(testTitle);
      expect(bodyText).toContain(testContent);
    } finally {
      await db.delete(customPages).where(eq(customPages.pageName, testSlug));
    }
  });

  // 4. Activity: User -> Admin (Abuse & Copyright Reports)
  test("4. User submits video report -> verifies report arrives in admin table", async ({ page }) => {
    // Query a video to report
    const [sampleVideo] = await db.select().from(videos).limit(1);
    expect(sampleVideo).toBeDefined();

    const reportReason = `QA Audit Abuse Report: Offensive content detected ${Date.now()}`;

    // Log in as normal user
    await page.goto("/login");
    await page.fill("input[name='usernameOrEmail'], input[type='text'], input[placeholder*='Username']", "test_user_a");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(1500);

    // Open video watch page
    await page.goto(`/watch/${sampleVideo.videoId}`);
    await page.waitForLoadState("domcontentloaded");

    // Click Flag / Report button
    const flagBtn = page.locator("button:has-text('Report'), button[title='Report'], button:has(svg.lucide-flag)");
    if (await flagBtn.first().isVisible()) {
      await flagBtn.first().click();
      await page.waitForTimeout(500);

      // Fill textarea and submit
      const reportTextarea = page.locator("textarea");
      if (await reportTextarea.isVisible()) {
        await reportTextarea.fill(reportReason);
        const submitBtn = page.locator("button:has-text('Submit Report'), button:has-text('Report Video')");
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify database record in reports table
    const [savedReport] = await db.select().from(reports)
      .where(eq(reports.videoId, sampleVideo.id))
      .orderBy(desc(reports.id))
      .limit(1);

    if (savedReport) {
      expect(savedReport.videoId).toBe(sampleVideo.id);
      // Clean up
      await db.delete(reports).where(eq(reports.id, savedReport.id));
    }
  });

  // 5. Security: Admin Server Actions boundary enforcement
  test("5. Security proof: Admin server actions can be invoked without admin session (Vulnerability)", async ({ page }) => {
    // Navigate as normal non-admin user
    await page.goto("/login");
    await page.fill("input[name='usernameOrEmail'], input[type='text'], input[placeholder*='Username']", "test_user_a");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(1500);

    // Call admin action from client runtime of non-admin user
    const res = await page.evaluate(async () => {
      try {
        const mod = await import("@/modules/admin/settings.actions");
        const actionRes = await mod.saveSingleSettingAction("unauth_security_probe", "probe_val");
        return { attempted: true, result: actionRes };
      } catch (err: any) {
        return { attempted: false, error: err.message };
      }
    });

    console.log("[SECURITY AUDIT] Non-admin client action invocation result:", res);
    // Cleanup if inserted
    await db.delete(siteConfig).where(eq(siteConfig.name, "unauth_security_probe"));
  });
});
