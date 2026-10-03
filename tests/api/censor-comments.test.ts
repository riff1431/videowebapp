import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/db";
import { siteConfig, users, videos, comments, commentReplies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { censorText } from "@/lib/security/censor";
import {
  addCommentAction,
  addCommentReplyAction,
  loadMoreCommentsAction,
} from "@/modules/videos/video.actions";

describe("Phase 1.3: Autoplay, Censored Words, and Comments Limit/Pagination", () => {
  let testUserId: number;
  let testVideoDbId: number;

  beforeAll(async () => {
    // 1. Setup user
    const [u] = await db
      .insert(users)
      .values({
        username: "censor_test_user",
        email: "censor_test@example.com",
        role: "user",
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { role: "user" },
      })
      .returning();
    testUserId = u.id;

    // 2. Setup video
    const [v] = await db
      .insert(videos)
      .values({
        videoId: "censor_vid_" + Math.random().toString(36).slice(2, 8),
        userId: testUserId,
        title: "Test Video for Comments",
        videoLocation: "https://example.com/video.mp4",
        thumbnail: "https://example.com/thumb.jpg",
      })
      .returning();
    testVideoDbId = v.id;

    // 3. Set censored words in site_config
    await db
      .insert(siteConfig)
      .values({ name: "censored_words", value: "badword, spammer, hack" })
      .onConflictDoUpdate({
        target: siteConfig.name,
        set: { value: "badword, spammer, hack" },
      });
  });

  afterAll(async () => {
    await db
      .insert(siteConfig)
      .values({ name: "censored_words", value: "" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "" } });

    await db
      .insert(siteConfig)
      .values({ name: "comments_default_num", value: "20" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "20" } });
  });

  describe("Censoring", () => {
    it("masks forbidden words with *** case-insensitively", async () => {
      const input = "This is a BadWord from a Spammer who tried to hack the system";
      const censored = await censorText(input);
      expect(censored).toBe("This is a *** from a *** who tried to *** the system");
    });

    it("leaves normal words intact", async () => {
      const input = "Hello world! This is a great video.";
      const censored = await censorText(input);
      expect(censored).toBe("Hello world! This is a great video.");
    });
  });

  describe("Comment Pagination and Load More", () => {
    beforeAll(async () => {
      // Insert 15 test comments
      const commentValues = Array.from({ length: 15 }).map((_, i) => ({
        userId: testUserId,
        videoId: testVideoDbId,
        text: `Paginated comment number ${i + 1}`,
        createdAt: new Date(Date.now() + i * 1000),
      }));
      await db.insert(comments).values(commentValues);

      // Configure default comments per page = 5
      await db
        .insert(siteConfig)
        .values({ name: "comments_default_num", value: "5" })
        .onConflictDoUpdate({ target: siteConfig.name, set: { value: "5" } });
    });

    it("fetches the first batch respecting comments_default_num", async () => {
      const res = await loadMoreCommentsAction({
        videoId: testVideoDbId,
        offset: 0,
        limit: 5,
      });

      expect(res.success).toBe(true);
      expect(res.comments.length).toBe(5);
      expect(res.hasMore).toBe(true);
    });

    it("fetches the next offset batch correctly", async () => {
      const batch1 = await loadMoreCommentsAction({
        videoId: testVideoDbId,
        offset: 0,
        limit: 5,
      });

      const batch2 = await loadMoreCommentsAction({
        videoId: testVideoDbId,
        offset: 5,
        limit: 5,
      });

      expect(batch2.success).toBe(true);
      expect(batch2.comments.length).toBe(5);
      // Verify no overlap between batch 1 and batch 2 IDs
      const ids1 = new Set(batch1.comments.map((c) => c.id));
      for (const c of batch2.comments) {
        expect(ids1.has(c.id)).toBe(false);
      }
    });

    it("indicates hasMore is false on the last batch", async () => {
      const lastBatch = await loadMoreCommentsAction({
        videoId: testVideoDbId,
        offset: 14,
        limit: 5,
      });

      expect(lastBatch.success).toBe(true);
      expect(lastBatch.comments.length).toBeLessThanOrEqual(5);
      // Since total inserted was 15, offset 14 returns 1 item, which is < limit 5
      expect(lastBatch.hasMore).toBe(false);
    });
  });
});
