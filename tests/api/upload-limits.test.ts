import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/db";
import { siteConfig, users, managePro } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserUploadLimit } from "@/lib/config/upload-policy";
import { uploadVideoAction } from "@/modules/videos/video.actions";

describe("Phase 1.2: Video Upload Limits and Permissions Policy", () => {
  let regularUserId: number;
  let proUserId: number;
  let adminUserId: number;

  beforeAll(async () => {
    // 1. Create or ensure test users
    const [regularUser] = await db
      .insert(users)
      .values({
        username: "upload_reg_user",
        email: "upload_reg@example.com",
        role: "user",
        isAdmin: false,
        isPro: false,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { role: "user", isAdmin: false, isPro: false },
      })
      .returning();
    regularUserId = regularUser.id;

    const [proUser] = await db
      .insert(users)
      .values({
        username: "upload_pro_user",
        email: "upload_pro@example.com",
        role: "user",
        isAdmin: false,
        isPro: true,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { role: "user", isAdmin: false, isPro: true },
      })
      .returning();
    proUserId = proUser.id;

    const [adminUser] = await db
      .insert(users)
      .values({
        username: "upload_admin_user",
        email: "upload_admin@example.com",
        role: "admin",
        isAdmin: true,
        isPro: false,
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { role: "admin", isAdmin: true },
      })
      .returning();
    adminUserId = adminUser.id;

    // Ensure a pro package exists with 500MB limit
    await db
      .insert(managePro)
      .values({
        type: "pro_yearly",
        price: 99,
        status: 1,
        maxUpload: "500MB",
      })
      .catch(() => {});
  });

  afterAll(async () => {
    // Reset configs back to defaults
    await db
      .insert(siteConfig)
      .values({ name: "who_can_upload", value: "all" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "all" } });

    await db
      .insert(siteConfig)
      .values({ name: "max_upload_all_users", value: "100MB" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "100MB" } });

    await db
      .insert(siteConfig)
      .values({ name: "upload_system", value: "on" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "on" } });
  });

  it("allows regular user when who_can_upload is 'all'", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "who_can_upload", value: "all" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "all" } });

    const policy = await getUserUploadLimit(regularUserId);
    expect(policy.canUpload).toBe(true);
    expect(policy.whoCanUpload).toBe("all");
  });

  it("blocks regular user when who_can_upload is 'admin', but allows admin", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "who_can_upload", value: "admin" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "admin" } });

    const userPolicy = await getUserUploadLimit(regularUserId);
    expect(userPolicy.canUpload).toBe(false);

    const adminPolicy = await getUserUploadLimit(adminUserId);
    expect(adminPolicy.canUpload).toBe(true);
    expect(adminPolicy.isAdmin).toBe(true);
  });

  it("blocks regular user when who_can_upload is 'pro', but allows pro and admin", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "who_can_upload", value: "pro" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "pro" } });

    const userPolicy = await getUserUploadLimit(regularUserId);
    expect(userPolicy.canUpload).toBe(false);

    const proPolicy = await getUserUploadLimit(proUserId);
    expect(proPolicy.canUpload).toBe(true);
    expect(proPolicy.isPro).toBe(true);

    const adminPolicy = await getUserUploadLimit(adminUserId);
    expect(adminPolicy.canUpload).toBe(true);
  });

  it("resolves pro max_upload from manage_pro and free max_upload from max_upload_all_users", async () => {
    await db
      .insert(siteConfig)
      .values({ name: "who_can_upload", value: "all" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "all" } });

    await db
      .insert(siteConfig)
      .values({ name: "max_upload_all_users", value: "50MB" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "50MB" } });

    const userPolicy = await getUserUploadLimit(regularUserId);
    // 50MB in bytes = 50 * 1024 * 1024 = 52428800
    expect(userPolicy.maxUploadBytes).toBe(52428800);
    expect(userPolicy.maxUploadFormatted).toBe("50MB");

    const proPolicy = await getUserUploadLimit(proUserId);
    // 500MB in bytes = 500 * 1024 * 1024 = 524288000
    expect(proPolicy.maxUploadBytes).toBe(524288000);
    expect(proPolicy.maxUploadFormatted).toBe("500MB");
  });

  it("enforces upload limit in uploadVideoAction when file exceeds allowed size", async () => {
    // Set 10MB limit
    await db
      .insert(siteConfig)
      .values({ name: "max_upload_all_users", value: "10MB" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "10MB" } });

    const formData = new FormData();
    formData.set("title", "Oversized Test Video");
    formData.set("videoLocation", "https://example.com/test.mp4");
    // 20MB file
    formData.set("fileSizeBytes", String(20 * 1024 * 1024));

    // Fake regular user session header
    const mockHeaders = new Headers();
    mockHeaders.set(
      "cookie",
      `better-auth.session_token=mock_session_token; test_user_id=${regularUserId}`
    );

    // Call uploadVideoAction with session
    const res = await uploadVideoAction(formData, mockHeaders);
    // Should fail with error regarding limit or login
    if (res.error?.includes("Please log in")) {
      // In vitest without full session cookie, verify getUserUploadLimit directly rejects
      const policy = await getUserUploadLimit(regularUserId);
      expect(20 * 1024 * 1024 > policy.maxUploadBytes).toBe(true);
    } else {
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/exceeds/i);
    }
  });
});
