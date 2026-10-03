import { describe, it, expect, beforeAll } from "vitest";
import { requestPasswordResetAction } from "@/modules/auth/password.actions";
import { seedTestData, SeedData } from "../setup/seed";
import { db } from "@/db";
import { verifications } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("0.2 Security: Password Reset Flow Suite", () => {
  let seed: SeedData;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  it("returns identical generic response whether the email exists or not", async () => {
    // 1. Existing user
    const existingFormData = new FormData();
    existingFormData.set("email", seed.userA.email);
    const existingRes = await requestPasswordResetAction(existingFormData);

    expect(existingRes.success).toBe(true);
    expect((existingRes as any).message).toBe(
      "If an account with that email exists, password reset instructions have been sent."
    );

    // 2. Non-existent user
    const nonExistingFormData = new FormData();
    nonExistingFormData.set("email", "completely_unknown_user_12345@playtube.test");
    const nonExistingRes = await requestPasswordResetAction(nonExistingFormData);

    expect(nonExistingRes.success).toBe(true);
    expect((nonExistingRes as any).message).toBe(
      "If an account with that email exists, password reset instructions have been sent."
    );

    // Responses should be completely identical in structure and text
    expect(existingRes).toEqual(nonExistingRes);
  });

  it("never returns a token or direct reset link in the response payload", async () => {
    const formData = new FormData();
    formData.set("email", seed.userA.email);
    const res: any = await requestPasswordResetAction(formData);

    expect(res).not.toHaveProperty("demoResetUrl");
    expect(res).not.toHaveProperty("token");
    expect(res).not.toHaveProperty("resetToken");
    expect(res).not.toHaveProperty("url");
    expect(res).not.toHaveProperty("link");

    const jsonStr = JSON.stringify(res);
    expect(jsonStr).not.toContain("token=");
    expect(jsonStr).not.toContain("reset-password");
  });

  it("creates a verification record in the database for valid registered user", async () => {
    const rows = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, seed.userA.email));

    expect(rows.length).toBeGreaterThan(0);
    const latest = rows[rows.length - 1];
    expect(latest.value).toBeTruthy();
    expect(new Date(latest.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});
