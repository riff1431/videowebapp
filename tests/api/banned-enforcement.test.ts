import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { proxy, getClientIp } from "@/proxy";
import { assertUser } from "@/lib/auth/assert-admin";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { bannedIps, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

describe("Phase 0.6: Banned IPs and Inactive User Enforcement", () => {
  const TEST_BANNED_IP = "198.51.100.99";
  const TEST_ALLOWED_IP = "203.0.113.50";

  beforeAll(async () => {
    // Ensure banned IP exists in banned_ips table
    await db.delete(bannedIps).where(eq(bannedIps.ipAddress, TEST_BANNED_IP));
    await db.insert(bannedIps).values({
      ipAddress: TEST_BANNED_IP,
      time: new Date(),
    });
  });

  afterAll(async () => {
    await db.delete(bannedIps).where(eq(bannedIps.ipAddress, TEST_BANNED_IP));
  });

  describe("Proxy IP Banning", () => {
    it("correctly extracts client IP from headers", () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-forwarded-for": "198.51.100.99, 10.0.0.1" },
      });
      expect(getClientIp(req)).toBe("198.51.100.99");

      const reqReal = new NextRequest("http://localhost:3000/api/test", {
        headers: { "x-real-ip": "203.0.113.50" },
      });
      expect(getClientIp(reqReal)).toBe("203.0.113.50");
    });

    it("returns 403 Forbidden when client IP is banned", async () => {
      const req = new NextRequest("http://localhost:3000/some-page", {
        headers: { "x-forwarded-for": TEST_BANNED_IP },
      });

      const res = await proxy(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("FORBIDDEN: Your IP address has been banned");
    });

    it("allows request when client IP is not banned", async () => {
      const req = new NextRequest("http://localhost:3000/some-page", {
        headers: { "x-forwarded-for": TEST_ALLOWED_IP },
      });

      const res = await proxy(req);
      // NextResponse.next() typically has status 200 or header x-middleware-next
      expect(res.status).not.toBe(403);
    });
  });

  describe("Suspended / Inactive User Blocking (active=false)", () => {
    let testUserId: number;
    let cookieHeader: string;

    beforeAll(async () => {
      // Find or setup an active user
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.username, "test_user_b"))
        .limit(1);

      if (u) {
        testUserId = u.id;
        // Ensure user is active initially
        await db.update(users).set({ active: true }).where(eq(users.id, testUserId));

        // Sign in to get session cookie
        const res = await auth.api.signInEmail({
          body: {
            email: u.email,
            password: "password123",
          },
          asResponse: true,
        });
        cookieHeader = res.headers.get("set-cookie") || "";
      }
    });

    it("allows active user in assertUser", async () => {
      if (!testUserId || !cookieHeader) return;

      // Ensure active is true
      await db.update(users).set({ active: true }).where(eq(users.id, testUserId));

      const headers = new Headers();
      headers.set("cookie", cookieHeader);

      const user = await assertUser(headers);
      expect(user.id).toBe(testUserId);
      expect(user.active).toBe(true);
    });

    it("rejects suspended user (active=false) in assertUser with FORBIDDEN", async () => {
      if (!testUserId || !cookieHeader) return;

      // Deactivate user
      await db.update(users).set({ active: false }).where(eq(users.id, testUserId));

      const headers = new Headers();
      headers.set("cookie", cookieHeader);

      await expect(assertUser(headers)).rejects.toThrow("FORBIDDEN: User account is suspended or banned");

      // Restore user
      await db.update(users).set({ active: true }).where(eq(users.id, testUserId));
    });

    it("rejects login attempt if user active is false", async () => {
      if (!testUserId) return;

      // Deactivate user
      await db.update(users).set({ active: false }).where(eq(users.id, testUserId));

      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      await expect(
        auth.api.signInEmail({
          body: {
            email: u.email,
            password: "password123",
          },
        })
      ).rejects.toThrow("FORBIDDEN: User account is suspended or banned");

      // Restore user
      await db.update(users).set({ active: true }).where(eq(users.id, testUserId));
    });
  });
});
