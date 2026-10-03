import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Phase 3: Internationalization (i18n) and Translation Binding", () => {
  it("verifies forgot-password and reset-password use useTranslation hook for UI strings", () => {
    const forgotPw = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/(auth)/forgot-password/page.tsx"),
      "utf8"
    );
    expect(forgotPw).toContain('useTranslation');
    expect(forgotPw).toContain('t("reset_password"');
    expect(forgotPw).toContain('t("request_new_password"');

    const resetPw = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/(auth)/reset-password/page.tsx"),
      "utf8"
    );
    expect(resetPw).toContain('useTranslation');
    expect(resetPw).toContain('t("change_password"');
    expect(resetPw).toContain('t("confirm_password"');
  });

  it("verifies ads management client uses translation dictionary", () => {
    const adsClient = fs.readFileSync(
      path.resolve(process.cwd(), "src/app/(public)/ads/AdsClient.tsx"),
      "utf8"
    );
    expect(adsClient).toContain('useTranslation');
    expect(adsClient).toContain('t("advertising"');
    expect(adsClient).toContain('t("create_ad"');
    expect(adsClient).toContain('t("available_balance"');
  });

  it("verifies language provider provides parameter interpolation", () => {
    const langProvider = fs.readFileSync(
      path.resolve(process.cwd(), "src/providers/language-provider.tsx"),
      "utf8"
    );
    expect(langProvider).toContain('export function useTranslation()');
    expect(langProvider).toContain('params?: Record<string, string | number>');
  });
});
