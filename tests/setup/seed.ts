import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { db, pool } from "@/db";
import {
  users,
  categories,
  videos,
  playlists,
  playlistVideos,
  comments,
  likesDislikes,
  subscriptions,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

export interface SeedData {
  userA: { id: number; email: string; username: string };
  userB: { id: number; email: string; username: string };
  adminUser: { id: number; email: string; username: string };
  categories: { id: number; key: string; name: string }[];
  videos: {
    publicVideo: { id: number; videoId: string; title: string };
    privateVideo: { id: number; videoId: string; title: string };
    unlistedVideo: { id: number; videoId: string; title: string };
  };
}

export async function seedTestData(): Promise<SeedData> {
  console.log("--> Seeding test dataset (User A, User B, Admin, categories, sample videos)...");

  // 1. Ensure Categories exist
  const sampleCategories = [
    { key: "test-tech", name: "Test Technology", sortOrder: 1 },
    { key: "test-gaming", name: "Test Gaming", sortOrder: 2 },
    { key: "test-music", name: "Test Music", sortOrder: 3 },
  ];

  for (const cat of sampleCategories) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoUpdate({
        target: categories.key,
        set: { name: cat.name },
      });
  }

  const allCategories = await db
    .select({ id: categories.id, key: categories.key, name: categories.name })
    .from(categories);

  // 2. Ensure Users exist (User A, User B, Admin User)
  const testUsersConfig = [
    {
      name: "Test User A",
      username: "test_user_a",
      email: "user_a@playtube.test",
      password: "password123",
      role: "user",
      isAdmin: false,
    },
    {
      name: "Test User B",
      username: "test_user_b",
      email: "user_b@playtube.test",
      password: "password123",
      role: "user",
      isAdmin: false,
    },
    {
      name: "Test Admin",
      username: "test_admin",
      email: "admin@playtube.test",
      password: "adminpassword123",
      role: "admin",
      isAdmin: true,
    },
  ];

  for (const u of testUsersConfig) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, u.email), eq(users.username, u.username)))
      .limit(1);

    if (existing.length === 0) {
      await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
          username: u.username,
        },
      });

      // Update role & isAdmin flag directly if admin
      if (u.isAdmin) {
        await db
          .update(users)
          .set({ role: "admin", isAdmin: true, verified: true })
          .where(eq(users.username, u.username));
      }
    }
  }

  const [dbUserA] = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(eq(users.username, "test_user_a"));

  const [dbUserB] = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(eq(users.username, "test_user_b"));

  const [dbAdmin] = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(eq(users.username, "test_admin"));

  // 3. Ensure Sample Videos owned by User A (public, private, unlisted)
  const catId = allCategories[0]?.id || 1;
  const testVideosConfig = [
    {
      videoId: "test_vid_pub_01",
      title: "PlayTube Public Test Video",
      description: "Automated public test video description for testing feeds and playback.",
      videoLocation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640",
      userId: dbUserA.id,
      privacy: 0, // Public
      duration: "00:15",
      categoryId: String(catId),
    },
    {
      videoId: "test_vid_priv_02",
      title: "PlayTube Private Test Video",
      description: "Automated private video. Must not be visible to anonymous or other users.",
      videoLocation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1518791841217?w=640",
      userId: dbUserA.id,
      privacy: 1, // Private
      duration: "00:20",
      categoryId: String(catId),
    },
    {
      videoId: "test_vid_unlisted_03",
      title: "PlayTube Unlisted Test Video",
      description: "Automated unlisted video accessible only via direct link.",
      videoLocation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnail: "https://images.unsplash.com/photo-1516116211227?w=640",
      userId: dbUserA.id,
      privacy: 2, // Unlisted
      duration: "00:30",
      categoryId: String(catId),
    },
  ];

  for (const v of testVideosConfig) {
    const existing = await db
      .select({ id: videos.id })
      .from(videos)
      .where(eq(videos.videoId, v.videoId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(videos).values(v);
    } else {
      await db.update(videos).set(v).where(eq(videos.videoId, v.videoId));
    }
  }

  const [publicVid] = await db
    .select({ id: videos.id, videoId: videos.videoId, title: videos.title })
    .from(videos)
    .where(eq(videos.videoId, "test_vid_pub_01"));

  const [privateVid] = await db
    .select({ id: videos.id, videoId: videos.videoId, title: videos.title })
    .from(videos)
    .where(eq(videos.videoId, "test_vid_priv_02"));

  const [unlistedVid] = await db
    .select({ id: videos.id, videoId: videos.videoId, title: videos.title })
    .from(videos)
    .where(eq(videos.videoId, "test_vid_unlisted_03"));

  console.log("--> Test seed completed successfully.");

  return {
    userA: dbUserA,
    userB: dbUserB,
    adminUser: dbAdmin,
    categories: allCategories,
    videos: {
      publicVideo: publicVid,
      privateVideo: privateVid,
      unlistedVideo: unlistedVid,
    },
  };
}

if (process.argv[1]?.includes("seed.ts")) {
  seedTestData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Test seed error:", err);
      process.exit(1);
    });
}
