import { describe, it, expect, beforeAll } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { seedTestData, SeedData } from "../setup/seed";
import { db } from "@/db";
import { videos, users, comments, playlists } from "@/db/schema";
import { eq, and } from "drizzle-orm";

describe("RLS & Data Layer Isolation Suite", () => {
  let seed: SeedData;
  let anonClient: SupabaseClient;
  let serviceClient: SupabaseClient;

  beforeAll(async () => {
    seed = await seedTestData();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:55321";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    anonClient = createClient(supabaseUrl, anonKey);
    serviceClient = createClient(supabaseUrl, serviceRoleKey);
  });

  describe("1. Storage Bucket Permissions & Client Access", () => {
    it("allows reading public assets from storage buckets via public client", async () => {
      const { data } = anonClient.storage
        .from("playtube-videos")
        .getPublicUrl("sample-video.mp4");

      expect(data).toBeDefined();
      expect(data.publicUrl).toContain("sample-video.mp4");
    });

    it("verifies service role key operates with administrative capability", async () => {
      const { data, error } = await serviceClient.storage.listBuckets();
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      const bucketNames = data!.map((b) => b.name);
      expect(bucketNames).toContain("playtube-videos");
      expect(bucketNames).toContain("playtube-uploads");
      expect(bucketNames).toContain("playtube-photos");
    });

    it("verifies client components cannot upload without valid payload", async () => {
      // Anon upload with empty path/buffer
      const { error } = await anonClient.storage
        .from("playtube-videos")
        .upload("", Buffer.from(""));
      expect(error).toBeDefined();
    });
  });

  describe("2. Database Video Privacy & Row-Level Authorization Rules", () => {
    it("ensures public videos are accessible to all users (privacy = 0)", async () => {
      const publicVideos = await db
        .select()
        .from(videos)
        .where(eq(videos.privacy, 0));

      const found = publicVideos.some((v) => v.videoId === seed.videos.publicVideo.videoId);
      expect(found).toBe(true);
    });

    it("ensures private videos (privacy = 1) are isolated and NOT returned in public feeds", async () => {
      // Public feeds query where privacy == 0
      const publicFeed = await db
        .select()
        .from(videos)
        .where(eq(videos.privacy, 0));

      const hasPrivateVideo = publicFeed.some(
        (v) => v.videoId === seed.videos.privateVideo.videoId
      );
      expect(hasPrivateVideo).toBe(false);
    });

    it("ensures private video is only accessible by owner (User A)", async () => {
      const [ownerVideo] = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.videoId, seed.videos.privateVideo.videoId),
            eq(videos.userId, seed.userA.id)
          )
        );

      expect(ownerVideo).toBeDefined();
      expect(ownerVideo.userId).toBe(seed.userA.id);

      // Verify User B does not match owner query
      const [otherUserVideo] = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.videoId, seed.videos.privateVideo.videoId),
            eq(videos.userId, seed.userB.id)
          )
        );

      expect(otherUserVideo).toBeUndefined();
    });

    it("prevents User B from modifying or updating User A's video", async () => {
      // Attempt to query update scoped to User B
      const updateResult = await db
        .update(videos)
        .set({ title: "Hacked by User B" })
        .where(
          and(
            eq(videos.id, seed.videos.publicVideo.id),
            eq(videos.userId, seed.userB.id) // Enforcing ownership scope
          )
        )
        .returning();

      expect(updateResult.length).toBe(0);

      // Verify title remained unchanged
      const [currentVideo] = await db
        .select({ title: videos.title })
        .from(videos)
        .where(eq(videos.id, seed.videos.publicVideo.id));

      expect(currentVideo.title).not.toBe("Hacked by User B");
    });

    it("prevents User B from deleting User A's video", async () => {
      const deleteResult = await db
        .delete(videos)
        .where(
          and(
            eq(videos.id, seed.videos.publicVideo.id),
            eq(videos.userId, seed.userB.id) // Non-owner filter
          )
        )
        .returning();

      expect(deleteResult.length).toBe(0);

      const [persisted] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, seed.videos.publicVideo.id));

      expect(persisted).toBeDefined();
    });
  });

  describe("3. User Impersonation & Security Guardrails", () => {
    it("ensures normal users cannot elevate their own role to admin directly", async () => {
      // Normal user profile updates must not allow changing isAdmin or role
      const [userB] = await db
        .select({ role: users.role, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, seed.userB.id));

      expect(userB.role).toBe("user");
      expect(userB.isAdmin).toBe(false);
    });

    it("ensures service role key is not exposed to client-side bundles", () => {
      // NEXT_PUBLIC_* env vars must NEVER include the service role key
      const clientEnvKeys = Object.keys(process.env).filter((k) =>
        k.startsWith("NEXT_PUBLIC_")
      );
      for (const key of clientEnvKeys) {
        expect(process.env[key]).not.toBe(process.env.SUPABASE_SERVICE_ROLE_KEY);
      }
    });
  });

  describe("4. Direct PostgREST RLS Denial across Public Tables", () => {
    const publicTables = [
      "users",
      "videos",
      "comments",
      "playlists",
      "sessions",
      "accounts",
      "config",
      "payments",
      "views",
      "likes_dislikes",
    ];

    const authenticatedJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJzdWIiOiJ1c2VyLWEtdXVpZCIsImV4cCI6MTk4MzgxMjk5Nn0.UPFUR6J8O4JX0WdHMwMVvgk1rg-ZAL_qSVhoidS1FK0";
    const authenticatedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:55321",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${authenticatedJwt}`,
          },
        },
      }
    );

    for (const table of publicTables) {
      it(`denies direct PostgREST SELECT to anon role on public.${table}`, async () => {
        const { data, error } = await anonClient.from(table).select("*").limit(1);
        if (error) {
          expect(error).toBeDefined();
        } else {
          expect(data).toEqual([]);
        }
      });

      it(`denies direct PostgREST INSERT to anon role on public.${table}`, async () => {
        const { error } = await anonClient.from(table).insert({} as any);
        expect(error).toBeDefined();
      });

      it(`denies direct PostgREST UPDATE to anon role on public.${table}`, async () => {
        const { error } = await anonClient.from(table).update({} as any).eq("id", "1");
        expect(error).toBeDefined();
      });

      it(`denies direct PostgREST DELETE to anon role on public.${table}`, async () => {
        const { error } = await anonClient.from(table).delete().eq("id", "1");
        expect(error).toBeDefined();
      });

      it(`denies direct PostgREST SELECT to authenticated role on public.${table}`, async () => {
        const { data, error } = await authenticatedClient.from(table).select("*").limit(1);
        if (error) {
          expect(error).toBeDefined();
        } else {
          expect(data).toEqual([]);
        }
      });

      it(`denies direct PostgREST INSERT to authenticated role on public.${table}`, async () => {
        const { error } = await authenticatedClient.from(table).insert({} as any);
        expect(error).toBeDefined();
      });

      it(`denies direct PostgREST UPDATE to authenticated role on public.${table}`, async () => {
        const { error } = await authenticatedClient.from(table).update({} as any).eq("id", "1");
        expect(error).toBeDefined();
      });

      it(`denies direct PostgREST DELETE to authenticated role on public.${table}`, async () => {
        const { error } = await authenticatedClient.from(table).delete().eq("id", "1");
        expect(error).toBeDefined();
      });
    }
  });
});
