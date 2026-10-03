import { describe, it, expect, beforeAll } from "vitest";
import { auth } from "@/lib/auth/auth";
import { assertAdmin, assertUser } from "@/lib/auth/assert-admin";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";
import { bulkUserAction } from "@/modules/admin/users.actions";
import { deleteVideoAction as deleteVideoAdminAction } from "@/modules/admin/videos.actions";
import { seedTestData, SeedData } from "../setup/seed";

describe("0.1 Security: Admin Authorization Enforcement Suite", () => {
  let seed: SeedData;
  let adminHeaders: Headers;
  let normalUserHeaders: Headers;

  beforeAll(async () => {
    seed = await seedTestData();

    // Authenticate as normal user
    const userRes = await auth.api.signInEmail({
      body: {
        email: "user_a@playtube.test",
        password: "password123",
      },
      asResponse: true,
    });
    const userCookie = userRes.headers.get("set-cookie") || "";
    normalUserHeaders = new Headers();
    normalUserHeaders.set("cookie", userCookie);

    // Authenticate as admin user
    const adminRes = await auth.api.signInEmail({
      body: {
        email: "admin@playtube.test",
        password: "adminpassword123",
      },
      asResponse: true,
    });
    const adminCookie = adminRes.headers.get("set-cookie") || "";
    adminHeaders = new Headers();
    adminHeaders.set("cookie", adminCookie);
  });

  describe("assertAdmin / assertUser direct checks", () => {
    it("rejects anonymous caller with UNAUTHORIZED", async () => {
      const anonHeaders = new Headers();
      await expect(assertAdmin(anonHeaders)).rejects.toThrow("UNAUTHORIZED: Authentication required");
      await expect(assertUser(anonHeaders)).rejects.toThrow("UNAUTHORIZED: Authentication required");
    });

    it("rejects normal non-admin user with FORBIDDEN", async () => {
      // assertUser succeeds
      const user = await assertUser(normalUserHeaders);
      expect(user.id).toBe(seed.userA.id);
      expect(user.isAdmin).toBe(false);

      // assertAdmin throws FORBIDDEN
      await expect(assertAdmin(normalUserHeaders)).rejects.toThrow("FORBIDDEN: Administrator privileges required");
    });

    it("succeeds for authenticated administrator", async () => {
      const admin = await assertAdmin(adminHeaders);
      expect(admin.id).toBe(seed.adminUser.id);
      expect(admin.isAdmin).toBe(true);
      expect(admin.role).toBe("admin");
    });
  });

  describe("Admin actions rejection when invoked without admin session", () => {
    it("rejects saveSingleSettingAction for anonymous caller", async () => {
      await expect(saveSingleSettingAction("site_name", "Hacked")).rejects.toThrow(
        /UNAUTHORIZED|FORBIDDEN/
      );
    });

    it("rejects bulkUserAction for anonymous caller", async () => {
      await expect(bulkUserAction([seed.userB.id], "deactivate")).rejects.toThrow(
        /UNAUTHORIZED|FORBIDDEN/
      );
    });

    it("rejects deleteVideoAdminAction for anonymous caller", async () => {
      await expect(deleteVideoAdminAction(seed.videos.publicVideo.id)).rejects.toThrow(
        /UNAUTHORIZED|FORBIDDEN/
      );
    });
  });
});
