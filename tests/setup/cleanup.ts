import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { db, pool } from "@/db";
import {
  users,
  videos,
  comments,
  likesDislikes,
  playlists,
  playlistVideos,
  subscriptions,
  watchHistory,
  watchLater,
} from "@/db/schema";
import { eq, inArray, or } from "drizzle-orm";

export async function cleanupTestData() {
  console.log("--> Cleaning up automated test records...");

  // 1. Find test user IDs
  const testUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      or(
        eq(users.username, "test_user_a"),
        eq(users.username, "test_user_b"),
        eq(users.username, "test_admin")
      )
    );

  const testUserIds = testUsers.map((u) => u.id);

  if (testUserIds.length > 0) {
    // Delete videos owned by test users
    await db.delete(videos).where(inArray(videos.userId, testUserIds));

    // Delete interactions
    await db.delete(comments).where(inArray(comments.userId, testUserIds));
    await db.delete(likesDislikes).where(inArray(likesDislikes.userId, testUserIds));
    await db.delete(subscriptions).where(inArray(subscriptions.subscriberId, testUserIds));
    await db.delete(watchHistory).where(inArray(watchHistory.userId, testUserIds));
    await db.delete(watchLater).where(inArray(watchLater.userId, testUserIds));

    // Delete test users (cascades sessions/accounts)
    await db.delete(users).where(inArray(users.id, testUserIds));
  }

  // Also clean up explicitly tagged test videos if any remain
  await db
    .delete(videos)
    .where(
      or(
        eq(videos.videoId, "test_vid_pub_01"),
        eq(videos.videoId, "test_vid_priv_02"),
        eq(videos.videoId, "test_vid_unlisted_03")
      )
    );

  console.log("--> Cleanup completed.");
}

if (process.argv[1]?.includes("cleanup.ts")) {
  cleanupTestData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Cleanup error:", err);
      process.exit(1);
    });
}
