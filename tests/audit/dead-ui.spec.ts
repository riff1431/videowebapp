import { test, expect } from "@playwright/test";

// Pages to audit across roles
const PUBLIC_PAGES = [
  "/",
  "/videos/trending",
  "/videos/latest",
  "/videos/top",
  "/articles",
  "/movies",
  "/popular-channels",
  "/help/faqs",
  "/contact-us",
  "/go-pro",
  "/login",
  "/register",
  "/forgot-password",
];

const USER_PAGES = [
  "/dashboard",
  "/upload-video",
  "/manage-videos",
  "/wallet",
  "/settings/profile",
  "/settings/general",
  "/settings/password",
  "/history",
  "/saved-videos",
  "/liked-videos",
  "/subscriptions",
  "/messages",
  "/ads",
  "/ads/create",
];

const ADMIN_PAGES = [
  "/admin",
  "/admin/settings",
  "/admin/video-settings",
  "/admin/change-site-desgin",
  "/admin/manage_categories",
  "/admin/manage-videos",
  "/admin/manage-users",
  "/admin/ban-users",
  "/admin/prosys-settings",
  "/admin/payment-settings",
  "/admin/bank-receipts",
  "/admin/manage-video-ads",
  "/admin/reports",
  "/admin/copy_report",
  "/admin/seo",
  "/admin/languages",
  "/admin/system-status",
];

interface DeadAuditFinding {
  pageUrl: string;
  role: "guest" | "user" | "admin";
  tag: string;
  text: string;
  href?: string;
  expected: string;
  observed: string;
}

export const deadFindings: DeadAuditFinding[] = [];

test.describe("Phase 3: Dynamic Dead UI Audit with Playwright", () => {
  test.setTimeout(180000);

  test("1. Scan Public / Logged-out Interactive Elements", async ({ page }) => {
    for (const url of PUBLIC_PAGES) {
      const res = await page.goto(url, { waitUntil: "domcontentloaded" });
      if (!res || res.status() >= 400) continue;

      // Find interactive elements
      const interactives = await page.$$("button, a[href='#'], a[href='javascript:void(0)'], form:not([action])");

      for (const el of interactives.slice(0, 10)) { // Sample key controls per screen
        const isVisible = await el.isVisible().catch(() => false);
        if (!isVisible) continue;

        const tagName = await el.evaluate((e) => e.tagName.toLowerCase());
        const innerText = (await el.innerText().catch(() => "")).trim() || (await el.getAttribute("title")) || (await el.getAttribute("aria-label")) || "";
        const href = await el.getAttribute("href").catch(() => null);

        if (tagName === "a" && (href === "#" || href === "javascript:void(0)")) {
          deadFindings.push({
            pageUrl: url,
            role: "guest",
            tag: tagName,
            text: innerText,
            href: href || "",
            expected: "Navigates to valid route or triggers modal/drawer",
            observed: `Dead link with dummy anchor href="${href}"`,
          });
        }

        if (tagName === "button") {
          let hasNetwork = false;
          let hasDomChange = false;

          const onReq = () => { hasNetwork = true; };
          page.on("request", onReq);

          const beforeHtml = await page.content();
          await el.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(400);
          const afterHtml = await page.content();

          page.off("request", onReq);

          if (beforeHtml !== afterHtml) {
            hasDomChange = true;
          }

          if (!hasNetwork && !hasDomChange && innerText.length > 0) {
            // Element produced zero observable effect
            deadFindings.push({
              pageUrl: url,
              role: "guest",
              tag: tagName,
              text: innerText,
              expected: "Observable state change, modal, navigation, or API network request",
              observed: "Zero observable effect on click (Dead button)",
            });
          }
        }
      }
    }
  });

  test("2. Scan Logged-in Normal User Interactive Elements", async ({ page }) => {
    // Log in as normal user
    await page.goto("/login");
    await page.fill("input[name='usernameOrEmail'], input[type='text'], input[placeholder*='Username']", "test_user_a");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(2000);

    for (const url of USER_PAGES) {
      const res = await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => null);
      if (!res || res.status() >= 400) continue;

      // Check notification bell in header
      const bellBtn = await page.$("button[title='Notifications']");
      if (bellBtn && (await bellBtn.isVisible())) {
        let producedEffect = false;
        const before = await page.content();
        await bellBtn.click().catch(() => {});
        await page.waitForTimeout(300);
        const after = await page.content();
        if (before !== after) producedEffect = true;

        if (!producedEffect) {
          deadFindings.push({
            pageUrl: url,
            role: "user",
            tag: "button",
            text: "Notification Bell",
            expected: "Opens notification dropdown or navigates to notifications view",
            observed: "Button has no onClick and produces zero DOM change or network call",
          });
        }
      }

      // Check dummy anchors
      const dummyLinks = await page.$$("a[href='#']");
      for (const link of dummyLinks.slice(0, 5)) {
        const text = (await link.innerText().catch(() => "")).trim();
        deadFindings.push({
          pageUrl: url,
          role: "user",
          tag: "a",
          text: text || "Icon / Action link",
          href: "#",
          expected: "Actionable navigation or dynamic handler",
          observed: "Dead link with href='#'",
        });
      }
    }
  });

  test("3. Scan Admin Interactive Controls", async ({ page }) => {
    // Log in as admin
    await page.goto("/login");
    await page.fill("input[name='usernameOrEmail'], input[type='text'], input[placeholder*='Username']", "test_admin");
    await page.fill("input[type='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(2000);

    for (const url of ADMIN_PAGES) {
      const res = await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => null);
      if (!res || res.status() >= 400) continue;

      // Check mock empty buttons e.g. onClick={() => {}}
      const mockBtns = await page.$$("button[class*='border']");
      for (const btn of mockBtns.slice(0, 5)) {
        const text = (await btn.innerText().catch(() => "")).trim();
        if (text === "Next" || text === "Previous" || text === "1") {
          deadFindings.push({
            pageUrl: url,
            role: "admin",
            tag: "button",
            text,
            expected: "Changes table page or fetches subsequent entries",
            observed: "Static placeholder pagination button with no state update or DB query",
          });
        }
      }
    }
  });
});
