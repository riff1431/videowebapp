import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Phase 2: Dead UI Elimination Verification", () => {
  it("ensures no onClick={() => {}} dummy handlers exist in admin moderation tables", () => {
    const adminComponents = [
      "src/components/admin/ManageMonetizationRequestsClient.tsx",
      "src/components/admin/ManageUsersClient.tsx",
      "src/components/admin/ManageVerificationRequestsClient.tsx",
      "src/components/admin/ManageVideoAdsClient.tsx",
      "src/components/admin/PaymentRequestsClient.tsx",
      "src/components/admin/ManageUserAdsClient.tsx",
    ];

    for (const comp of adminComponents) {
      const fileContent = fs.readFileSync(path.resolve(process.cwd(), comp), "utf8");
      expect(fileContent).not.toContain("onClick={() => {}}");
    }
  });

  it("ensures dead href='#' links are removed in settings clients", () => {
    const settingsFiles = [
      "src/components/admin/PaymentSettingsClient.tsx",
      "src/components/admin/AdsSettingsClient.tsx",
    ];

    for (const f of settingsFiles) {
      const fileContent = fs.readFileSync(path.resolve(process.cwd(), f), "utf8");
      expect(fileContent).not.toContain('href="#"');
    }
  });

  it("ensures public navigation notification bell is connected", () => {
    const navContent = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/layout/Navigation.tsx"),
      "utf8"
    );
    expect(navContent).toContain("<NotificationBell />");
    expect(navContent).not.toContain('button[title="Notifications"]');
  });

  it("ensures admin table pagination handles slicing properly", () => {
    const filesWithPagination = [
      "src/components/admin/ManageUsersClient.tsx",
      "src/components/admin/PaymentRequestsClient.tsx",
      "src/components/admin/ManageUserAdsClient.tsx",
      "src/components/admin/BankReceiptsClient.tsx",
    ];

    for (const file of filesWithPagination) {
      const content = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
      expect(content).toContain("currentPage");
      expect(content).toContain("pageSize");
      expect(content).toContain(".slice(");
    }
  });
});
