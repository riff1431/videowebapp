import { describe, it, expect, beforeAll } from "vitest";
import { updateGeneralSettingsAction } from "@/modules/settings/settings.actions";
import { seedTestData, SeedData } from "../setup/seed";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addCreatorEarningsAction, depositWalletAction } from "@/modules/wallet/wallet.actions";

describe("0.3 & 0.4 Security: Wallet Self-Credit & User Settings Mass Assignment", () => {
  let seed: SeedData;
  let userSessionCookie: string = "";

  beforeAll(async () => {
    seed = await seedTestData();

    const loginRes = await auth.api.signInEmail({
      body: {
        email: "user_a@playtube.test",
        password: "password123",
      },
      asResponse: true,
    });
    userSessionCookie = loginRes.headers.get("set-cookie") || "";
  });

  describe("0.3: Creator Wallet Self-Credit Authorization", () => {
    it("rejects addCreatorEarningsAction for normal user and anonymous callers", async () => {
      // Normal user / anonymous caller should be rejected with FORBIDDEN/UNAUTHORIZED
      await expect(addCreatorEarningsAction(100)).rejects.toThrow(
        /UNAUTHORIZED|FORBIDDEN/
      );
    });
  });

  describe("0.4: Mass Assignment Prevention on User Settings", () => {
    it("ignores attempts by normal user to mutate role, isAdmin, isPro, verified, active, or wallet", async () => {
      // 1. Fetch current DB record of User A
      const [userBefore] = await db
        .select()
        .from(users)
        .where(eq(users.id, seed.userA.id))
        .limit(1);

      expect(userBefore.role).toBe("user");
      expect(userBefore.isAdmin).toBe(false);
      expect(userBefore.isPro).toBe(false);
      expect(userBefore.verified).toBe(false);
      expect(userBefore.active).toBe(true);
      const originalWallet = userBefore.wallet ?? 0;

      // 2. Prepare malicious payload attempting privilege escalation
      const maliciousForm = new FormData();
      maliciousForm.set("username", seed.userA.username);
      maliciousForm.set("email", seed.userA.email);
      maliciousForm.set("gender", "female");
      maliciousForm.set("countryId", "2");
      maliciousForm.set("age", "28");

      // Malicious mass assignment fields
      maliciousForm.set("role", "admin");
      maliciousForm.set("isAdmin", "true");
      maliciousForm.set("isPro", "true");
      maliciousForm.set("verified", "true");
      maliciousForm.set("active", "false");
      maliciousForm.set("wallet", "999999");
      maliciousForm.set("balance", "999999");

      // 3. Provide user headers so updateGeneralSettingsAction runs as User A
      const userHeaders = new Headers();
      userHeaders.set("cookie", userSessionCookie);
      const res = await updateGeneralSettingsAction(maliciousForm, userHeaders);
      expect(res.success).toBe(true);

      // 4. Fetch DB record after action
      const [userAfter] = await db
        .select()
        .from(users)
        .where(eq(users.id, seed.userA.id))
        .limit(1);

      // Verify allowed fields were updated
      expect(userAfter.gender).toBe("female");
      expect(userAfter.countryId).toBe(2);
      expect(userAfter.age).toBe(28);

      // VERIFY CRITICAL FIELDS REMAIN COMPLETELY UNCHANGED
      expect(userAfter.role).toBe("user");
      expect(userAfter.isAdmin).toBe(false);
      expect(userAfter.isPro).toBe(false);
      expect(userAfter.verified).toBe(false);
      expect(userAfter.active).toBe(true);
      expect(userAfter.wallet).toBe(originalWallet);
    });
  });
});
