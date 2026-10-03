import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { siteConfig, adminInvitations, users, subscriptions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getRegistrationStatusAction } from "@/modules/auth/registration.actions";

describe("Phase 1.1 & 1.5: User Registration, Invite-Only Enforcement & Auto-Subscribe", () => {
  const INVITE_CODE_VALID = "TEST-INVITE-VALID-12345";
  const INVITE_CODE_USED = "TEST-INVITE-USED-67890";
  const TEST_ADMIN_USERNAME = "test_admin";

  beforeAll(async () => {
    // Clean up test invitation codes and test users if any
    await db.delete(adminInvitations).where(
      inArray(adminInvitations.code, [INVITE_CODE_VALID, INVITE_CODE_USED])
    );

    // Insert fresh invitations
    await db.insert(adminInvitations).values([
      {
        code: INVITE_CODE_VALID,
        status: 0, // Unused
      },
      {
        code: INVITE_CODE_USED,
        status: 1, // Used
      },
    ]);
  });

  afterAll(async () => {
    // Restore normal settings
    await db
      .insert(siteConfig)
      .values({ name: "user_registration", value: "on" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });

    await db
      .insert(siteConfig)
      .values({ name: "invite_links_system", value: "off" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

    await db.delete(adminInvitations).where(
      inArray(adminInvitations.code, [INVITE_CODE_VALID, INVITE_CODE_USED])
    );
  });

  describe("1.1 Registration Policy Enforcement", () => {
    it("reports registration enabled when user_registration is on", async () => {
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "on" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });
      await db
        .insert(siteConfig)
        .values({ name: "invite_links_system", value: "off" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

      const status = await getRegistrationStatusAction();
      expect(status.registrationEnabled).toBe(true);
      expect(status.inviteOnly).toBe(false);
    });

    it("rejects signup when registration is off and no invitation code is provided", async () => {
      // Turn registration OFF
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "off" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

      const status = await getRegistrationStatusAction();
      expect(status.registrationEnabled).toBe(false);
      expect(status.inviteOnly).toBe(true);

      const uniqueEmail = `blocked_${Date.now()}@test.com`;

      await expect(
        auth.api.signUpEmail({
          body: {
            email: uniqueEmail,
            password: "password123",
            name: "Blocked User",
            username: `blocked_${Date.now()}`,
          },
        })
      ).rejects.toThrow("Registration is currently disabled by administrator");
    });

    it("rejects signup with an invalid invitation code", async () => {
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "off" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

      await expect(
        auth.api.signUpEmail({
          body: {
            email: `invalid_code_${Date.now()}@test.com`,
            password: "password123",
            name: "Invalid Code User",
            username: `invalid_${Date.now()}`,
            inviteCode: "NON-EXISTENT-CODE",
          } as any,
        })
      ).rejects.toThrow("Invalid invitation code");
    });

    it("rejects signup with an already used invitation code", async () => {
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "off" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

      await expect(
        auth.api.signUpEmail({
          body: {
            email: `used_code_${Date.now()}@test.com`,
            password: "password123",
            name: "Used Code User",
            username: `used_${Date.now()}`,
            inviteCode: INVITE_CODE_USED,
          } as any,
        })
      ).rejects.toThrow("This invitation code has already been used");
    });

    it("allows signup with valid invitation code and marks code as used", async () => {
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "off" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "off" } });

      const uniqueUsername = `invited_${Date.now()}`;
      const uniqueEmail = `${uniqueUsername}@test.com`;

      const res = await auth.api.signUpEmail({
        body: {
          email: uniqueEmail,
          password: "password123",
          name: "Invited User",
          username: uniqueUsername,
          inviteCode: INVITE_CODE_VALID,
        } as any,
      });

      expect(res).toBeDefined();
      expect(res.user).toBeDefined();

      // Verify code status is now 1 (used)
      const [inv] = await db
        .select()
        .from(adminInvitations)
        .where(eq(adminInvitations.code, INVITE_CODE_VALID))
        .limit(1);

      expect(inv).toBeDefined();
      expect(inv.status).toBe(1);
    });
  });

  describe("1.5 Auto Subscribe on User Registration", () => {
    it("subscribes new user to configured accounts upon creation without self-subscribing", async () => {
      // Set auto_subscribe to admin username
      await db
        .insert(siteConfig)
        .values({ name: "auto_subscribe", value: TEST_ADMIN_USERNAME })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: TEST_ADMIN_USERNAME } });

      // Turn registration ON
      await db
        .insert(siteConfig)
        .values({ name: "user_registration", value: "on" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });

      const uniqueUsername = `autosub_${Date.now()}`;
      const uniqueEmail = `${uniqueUsername}@test.com`;

      const res = await auth.api.signUpEmail({
        body: {
          email: uniqueEmail,
          password: "password123",
          name: "Auto Sub User",
          username: uniqueUsername,
        },
      });

      expect(res.user).toBeDefined();
      const newUserId = Number(res.user.id);

      // Verify subscription created to TEST_ADMIN_USERNAME
      const [adminUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, TEST_ADMIN_USERNAME))
        .limit(1);

      expect(adminUser).toBeDefined();

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(
          inArray(subscriptions.subscriberId, [newUserId])
        )
        .limit(1);

      expect(sub).toBeDefined();
      expect(sub.channelId).toBe(adminUser.id);
    });
  });
});
