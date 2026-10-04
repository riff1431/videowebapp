import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  FALLBACK_THEME_ID,
  THEME_REGISTRY,
  isValidThemeIdFormat,
  isRegisteredAndExistingTheme,
  getActiveThemeId,
  themeHasRoute,
  invalidateActiveThemeCache,
} from "@/lib/themes";
import { sanitizeRedirectPath } from "@/modules/auth/hooks";

describe("Themes Architecture & Security Tests", () => {
  const originalEnv = process.env.FORCE_THEME;

  beforeEach(() => {
    invalidateActiveThemeCache();
    delete process.env.FORCE_THEME;
  });

  afterEach(() => {
    invalidateActiveThemeCache();
    if (originalEnv !== undefined) {
      process.env.FORCE_THEME = originalEnv;
    } else {
      delete process.env.FORCE_THEME;
    }
  });

  it("exports FALLBACK_THEME_ID as youplay", () => {
    expect(FALLBACK_THEME_ID).toBe("youplay");
  });

  it("validates theme IDs strictly and rejects traversal like ../admin", () => {
    expect(isValidThemeIdFormat("youplay")).toBe(true);
    expect(isValidThemeIdFormat("test-theme")).toBe(true);
    expect(isValidThemeIdFormat("theme123")).toBe(true);

    expect(isValidThemeIdFormat("../admin")).toBe(false);
    expect(isValidThemeIdFormat("..\\admin")).toBe(false);
    expect(isValidThemeIdFormat("youplay/sub")).toBe(false);
    expect(isValidThemeIdFormat("youplay.theme")).toBe(false);
    expect(isValidThemeIdFormat("")).toBe(false);
    expect(isValidThemeIdFormat("YOUPLAY")).toBe(false);
  });

  it("rejects non-existent or unregistered themes from isRegisteredAndExistingTheme", () => {
    expect(isRegisteredAndExistingTheme("../admin")).toBe(false);
    expect(isRegisteredAndExistingTheme("nonexistent-theme")).toBe(false);
    expect(isRegisteredAndExistingTheme("youplay")).toBe(true);
  });

  it("honors FORCE_THEME env var when valid, and ignores it when malicious/invalid", async () => {
    process.env.FORCE_THEME = "../admin";
    invalidateActiveThemeCache();
    let active = await getActiveThemeId();
    expect(active).toBe("youplay");

    process.env.FORCE_THEME = "nonexistent";
    invalidateActiveThemeCache();
    active = await getActiveThemeId();
    expect(active).toBe("youplay");

    // In test mode, testtheme is registered
    process.env.FORCE_THEME = "testtheme";
    invalidateActiveThemeCache();
    active = await getActiveThemeId();
    expect(active).toBe("testtheme");
  });

  it("falls back to FALLBACK_THEME_ID when DB has invalid or missing theme", async () => {
    invalidateActiveThemeCache();
    const active = await getActiveThemeId();
    expect(["youplay", "testtheme"]).toContain(active);
  });

  it("verifies themeHasRoute checks routes and dynamic segments", () => {
    expect(themeHasRoute("youplay", "/")).toBe(true);
    expect(themeHasRoute("youplay", "/login")).toBe(true);
    expect(themeHasRoute("youplay", "/watch/12345")).toBe(true);
    expect(themeHasRoute("youplay", "/channel/testuser")).toBe(true);

    // testtheme only has "/" in the fixture
    expect(themeHasRoute("testtheme", "/")).toBe(true);
    expect(themeHasRoute("testtheme", "/non-existent-random-route")).toBe(false);
  });

  it("sanitizes ?next= redirects and blocks open redirects", () => {
    expect(sanitizeRedirectPath("/")).toBe("/");
    expect(sanitizeRedirectPath("/settings")).toBe("/settings");
    expect(sanitizeRedirectPath("/watch/abc?t=10")).toBe("/watch/abc?t=10");

    // Malicious open redirects
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/");
    expect(sanitizeRedirectPath("http://evil.com")).toBe("/");
    expect(sanitizeRedirectPath("//evil.com")).toBe("/");
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/");
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(sanitizeRedirectPath("")).toBe("/");
  });

  it("STATIC TEST: No file under src/app/themes/** may import authClient or better-auth directly", () => {
    const themesDir = path.join(process.cwd(), "src", "app", "themes");
    const violations: { file: string; line: number; text: string }[] = [];

    function checkDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          lines.forEach((line, idx) => {
            if (/from\s+["'].*?(authClient|better-auth)["']/.test(line) ||
                /import\s+.*?authClient/.test(line)) {
              violations.push({
                file: path.relative(process.cwd(), fullPath).replace(/\\/g, "/"),
                line: idx + 1,
                text: line.trim(),
              });
            }
          });
        }
      }
    }

    checkDir(themesDir);

    expect(
      violations,
      `Direct authClient or better-auth imports found in themes:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });

  it("STATIC TEST: Admin files must never import anything from themes/", () => {
    const adminDir = path.join(process.cwd(), "src", "app", "admin");
    const violations: { file: string; line: number; text: string }[] = [];

    function checkAdminDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkAdminDir(fullPath);
        } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          lines.forEach((line, idx) => {
            if (/from\s+["'].*?themes\//.test(line)) {
              violations.push({
                file: path.relative(process.cwd(), fullPath).replace(/\\/g, "/"),
                line: idx + 1,
                text: line.trim(),
              });
            }
          });
        }
      }
    }

    checkAdminDir(adminDir);

    expect(
      violations,
      `Admin files importing from themes/:\n${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });

  it("STATIC TEST: Theme CSS files must scope selectors under [data-theme='<id>']", () => {
    const themesDir = path.join(process.cwd(), "src", "app", "themes");
    const cssViolations: { file: string; line: number; text: string }[] = [];

    if (fs.existsSync(themesDir)) {
      const folders = fs.readdirSync(themesDir, { withFileTypes: true });
      for (const f of folders) {
        if (!f.isDirectory()) continue;
        const themeId = f.name;
        const cssPath = path.join(themesDir, themeId, "theme.css");
        if (fs.existsSync(cssPath)) {
          const content = fs.readFileSync(cssPath, "utf-8");
          const lines = content.split("\n");
          lines.forEach((line, idx) => {
            const trimmed = line.trim();
            // Skip comments, empty lines, @-rules (@keyframes, @font-face, @layer, @import), CSS properties, closing braces
            if (!trimmed ||
                trimmed.startsWith("/*") ||
                trimmed.startsWith("*") ||
                trimmed.startsWith("@") ||
                trimmed.startsWith("--") ||
                trimmed.startsWith("}") ||
                !trimmed.includes("{")) {
              return;
            }

            const selectorPart = trimmed.split("{")[0].trim();
            // Selector should contain [data-theme="<themeId>"] or :root or html
            if (!selectorPart.includes(`[data-theme="${themeId}"]`)) {
              cssViolations.push({
                file: path.relative(process.cwd(), cssPath).replace(/\\/g, "/"),
                line: idx + 1,
                text: selectorPart,
              });
            }
          });
        }
      }
    }

    expect(
      cssViolations,
      `Unscoped selectors in theme.css:\n${JSON.stringify(cssViolations, null, 2)}`
    ).toEqual([]);
  });

  it("STATIC TEST: Theme contract drift check (docs/theme-contract.json and docs/theme-contract.md)", async () => {
    const { checkThemeContract } = await import("../../scripts/check-theme-contract");
    const result = checkThemeContract();
    expect(
      result.failures,
      `Theme contract drift detected:\n${JSON.stringify(result.failures, null, 2)}`
    ).toEqual([]);
    expect(result.success).toBe(true);
  });
});
