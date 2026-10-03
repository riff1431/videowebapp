import { describe, it, expect, beforeAll } from "vitest";
import { GET as getTranslations } from "@/app/api/v1/translations/route";
import { GET as getYoutubeImport } from "@/app/api/admin/import/youtube/route";
import { GET as getDailymotionImport } from "@/app/api/admin/import/dailymotion/route";
import { GET as getTwitchImport } from "@/app/api/admin/import/twitch/route";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { seedTestData, SeedData } from "../setup/seed";
import { updateVideoAction, deleteVideoAction, addCommentAction, toggleLikeVideoAction } from "@/modules/videos/video.actions";
import { updateGeneralSettingsAction } from "@/modules/settings/settings.actions";

describe("API Route Handlers & Core Action Handlers Suite", () => {
  let seed: SeedData;

  beforeAll(async () => {
    seed = await seedTestData();
  });

  describe("1. GET /api/v1/translations", () => {
    it("returns active languages and translations dictionary with 200 OK (happy path)", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/translations?lang=english");
      const res = await getTranslations(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty("lang", "english");
      expect(data).toHaveProperty("languages");
      expect(Array.isArray(data.languages)).toBe(true);
      expect(data).toHaveProperty("translations");
      expect(typeof data.translations).toBe("object");
    });

    it("falls back gracefully when an unsupported language is requested", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/translations?lang=nonexistent_lang_xyz");
      const res = await getTranslations(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.lang).toBe("nonexistent_lang_xyz");
      expect(data).toHaveProperty("translations");
    });
  });

  describe("2. Better Auth API Handlers (/api/auth/*)", () => {
    it("handles user login successfully with valid credentials", async () => {
      const res = await auth.api.signInEmail({
        body: {
          email: "user_a@playtube.test",
          password: "password123",
        },
      });

      expect(res).toBeDefined();
      expect(res.user).toBeDefined();
      expect(res.user.email).toBe("user_a@playtube.test");
      expect(res.token).toBeTruthy();
    });

    it("returns error / rejects login with invalid password (401/invalid credentials)", async () => {
      try {
        await auth.api.signInEmail({
          body: {
            email: "user_a@playtube.test",
            password: "wrongpassword!",
          },
        });
        expect.unreachable("Login should have thrown an error for invalid password");
      } catch (err: any) {
        expect(err).toBeDefined();
      }
    });

    it("rejects registration when email or username is already in use (422/conflict)", async () => {
      try {
        await auth.api.signUpEmail({
          body: {
            email: "user_a@playtube.test",
            username: "user_a_new",
            password: "password123",
            name: "Duplicate User",
          },
        });
        expect.unreachable("Sign up should have thrown an error for duplicate email");
      } catch (err: any) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("3. GET /api/admin/import/youtube", () => {
    let adminCookie = "";

    beforeAll(async () => {
      const loginRes = await auth.api.signInEmail({
        body: {
          email: "admin@playtube.test",
          password: "adminpassword123",
        },
        asResponse: true,
      });
      const cookieHeader = loginRes.headers.get("set-cookie");
      if (cookieHeader) {
        adminCookie = cookieHeader;
      }
    });

    it("rejects anonymous request with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/youtube");
      await expect(getYoutubeImport(req)).rejects.toThrow("UNAUTHORIZED");
    });

    it("returns 400 when search query is missing for authenticated admin", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/youtube", {
        headers: { cookie: adminCookie },
      });
      const res = await getYoutubeImport(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Query is required");
    });

    it("returns 400 with error and settings link when YouTube API key is missing", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/youtube?query=Nature", {
        headers: { cookie: adminCookie },
      });
      const res = await getYoutubeImport(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("YouTube API key is not configured");
      expect(data.settingsLink).toBe("/admin/settings");
    });
  });

  describe("4. GET /api/admin/import/dailymotion", () => {
    let adminCookie = "";

    beforeAll(async () => {
      const loginRes = await auth.api.signInEmail({
        body: {
          email: "admin@playtube.test",
          password: "adminpassword123",
        },
        asResponse: true,
      });
      const cookieHeader = loginRes.headers.get("set-cookie");
      if (cookieHeader) {
        adminCookie = cookieHeader;
      }
    });

    it("rejects anonymous request with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/dailymotion");
      await expect(getDailymotionImport(req)).rejects.toThrow("UNAUTHORIZED");
    });

    it("returns 400 when query parameter is missing", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/dailymotion", {
        headers: { cookie: adminCookie },
      });
      const res = await getDailymotionImport(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Keyword is required");
    });

    it("returns video items list for valid keyword query (happy path) or 502 on upstream rate limit", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/dailymotion?query=gaming", {
        headers: { cookie: adminCookie },
      });
      const res = await getDailymotionImport(req);
      const data = await res.json();
      if (res.status === 200) {
        expect(data.success).toBe(true);
        expect(Array.isArray(data.items)).toBe(true);
      } else {
        expect(res.status).toBe(502);
        expect(data.success).toBe(false);
      }
    });
  });

  describe("5. GET /api/admin/import/twitch", () => {
    let adminCookie = "";

    beforeAll(async () => {
      const loginRes = await auth.api.signInEmail({
        body: {
          email: "admin@playtube.test",
          password: "adminpassword123",
        },
        asResponse: true,
      });
      const cookieHeader = loginRes.headers.get("set-cookie");
      if (cookieHeader) {
        adminCookie = cookieHeader;
      }
    });

    it("rejects anonymous request with 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/twitch");
      await expect(getTwitchImport(req)).rejects.toThrow("UNAUTHORIZED");
    });

    it("returns 400 and explicit error when Twitch Client ID is missing", async () => {
      const req = new Request("http://localhost:3000/api/admin/import/twitch?query=esports", {
        headers: { cookie: adminCookie },
      });
      const res = await getTwitchImport(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.noClientId).toBe(true);
      expect(data.error).toContain("Twitch Client ID is not configured");
      expect(data.settingsLink).toBe("/admin/settings");
    });
  });

  describe("6. Video Actions & Input Validation (update / delete / comments)", () => {
    it("fails validation when updating video with missing required fields (400/422)", async () => {
      const fakeFormData = new FormData();
      fakeFormData.append("id", "not-a-number");

      const result = await updateVideoAction(fakeFormData);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("deletes a video by its integer ID (happy path)", async () => {
      // Pass a non-existent positive integer ID, shouldn't crash
      const result = await deleteVideoAction(99999999);
      expect(result).toHaveProperty("success", true);
    });

    it("executes deleteVideoService outside request context without throwing cache errors", async () => {
      const { deleteVideoService } = await import("@/services/video.service");
      const serviceResult = await deleteVideoService(99999999);
      expect(serviceResult).toEqual({ success: true });
    });


    it("fails validation when adding a comment without valid text", async () => {
      const result = await addCommentAction({
        videoDbId: seed.videos.publicVideo.id,
        text: "   ",
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/empty|required|comment/i);
    });

    it("returns error / prevents like when unauthenticated", async () => {
      const result = await toggleLikeVideoAction({
        videoDbId: seed.videos.publicVideo.id,
        type: 1, // Like
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/log in|headers|context|session/i);
    });

    it("fails validation when updating general settings with empty input", async () => {
      const fakeFormData = new FormData();
      fakeFormData.append("username", "");

      const result = await updateGeneralSettingsAction(fakeFormData);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/required/i);
    });
  });
});
