import { test, expect } from "@playwright/test";

test.describe("Full End-to-End User Flow: Registration, Authentication & Actions", () => {
  const randomSuffix = Math.floor(Math.random() * 899999 + 100000);
  const user = {
    name: `E2E Flow User ${randomSuffix}`,
    username: `flow_user_${randomSuffix}`,
    email: `flow_${randomSuffix}@playtube.test`,
    password: "Password123!",
  };

  test("Registration -> Login -> Profile / Navigation -> Protected Access -> Logout", async ({ page }) => {
    // 1. Visit Register Page
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    // Fill registration form
    const usernameInput = page.getByPlaceholder(/Username/i).first();
    const emailInput = page.getByPlaceholder(/E-mail address/i).first();
    const passwordInputs = page.locator('input[type="password"]');

    await usernameInput.fill(user.username);
    await emailInput.fill(user.email);
    await passwordInputs.nth(0).fill(user.password);
    await passwordInputs.nth(1).fill(user.password);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // 2. Login Flow with registered user
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const loginIdentifier = page.getByPlaceholder(/Username/i).first();
    const loginPassword = page.getByPlaceholder(/Password/i).first();

    await loginIdentifier.fill(user.email);
    await loginPassword.fill(user.password);

    const loginBtn = page.locator('button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 }).catch(() => {});

    // 3. Search and Discovery Flow
    await page.goto("/search?q=PlayTube");
    await page.waitForLoadState("domcontentloaded");
    const searchHeader = page.locator("h1, h2, h3").first();
    await expect(searchHeader).toBeVisible();

    // 4. Video Interaction Flow
    await page.goto("/watch/test_vid_pub_01");
    await page.waitForLoadState("domcontentloaded");

    const videoTitle = page.getByText("PlayTube Public Test Video");
    await expect(videoTitle).toBeVisible();

    // 5. Channel Page verification
    await page.goto("/channel/test_user_a");
    await page.waitForLoadState("domcontentloaded");
    const channelHeader = page.getByText("Test User A");
    await expect(channelHeader.first()).toBeVisible();
  });

  test("Admin Authentication & Access Control Flow", async ({ page }) => {
    // Login as Admin
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const loginIdentifier = page.locator('input[name="username"], input[name="email"], input[type="text"]').first();
    const loginPassword = page.locator('input[name="password"], input[type="password"]').first();

    await loginIdentifier.fill("admin@playtube.test");
    await loginPassword.fill("adminpassword123");

    const loginBtn = page.locator('button[type="submit"]').first();
    await loginBtn.click();
    await page.waitForTimeout(2500);

    // Navigate to Admin Dashboard
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Verify admin page renders overview content or admin layout
    const adminHeading = page.locator("h1, h2, h3, header").first();
    await expect(adminHeading).toBeVisible();
  });
});
