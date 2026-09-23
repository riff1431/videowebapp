import { db, pool } from "@/db";
import { categories, users, videos, siteConfig } from "@/db/schema";

export async function seedDatabase() {
  console.log("Seeding database with default PlayTube categories and admin...");

  // Default Categories
  const defaultCategories = [
    { key: "film", name: "Film & Animation", sortOrder: 1 },
    { key: "music", name: "Music", sortOrder: 2 },
    { key: "gaming", name: "Gaming", sortOrder: 3 },
    { key: "entertainment", name: "Entertainment", sortOrder: 4 },
    { key: "news", name: "News & Politics", sortOrder: 5 },
    { key: "education", name: "Education", sortOrder: 6 },
    { key: "tech", name: "Science & Technology", sortOrder: 7 },
    { key: "other", name: "Other", sortOrder: 8 },
  ];

  for (const cat of defaultCategories) {
    await db
      .insert(categories)
      .values(cat)
      .onConflictDoNothing({ target: categories.key });
  }

  // Default Administrator Account
  const [adminUser] = await db
    .insert(users)
    .values({
      name: "PlayTube Admin",
      username: "admin",
      email: "admin@playtube.local",
      emailVerified: true,
      role: "admin",
      isAdmin: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
      verified: true,
    })
    .onConflictDoNothing({ target: users.username })
    .returning();

  // Initial Demo Video if videos table is empty
  const existingVideos = await db.select().from(videos).limit(1);
  if (existingVideos.length === 0 && adminUser) {
    await db.insert(videos).values([
      {
        videoId: "welcome-playtube",
        userId: adminUser.id,
        title: "Welcome to PlayTube Next.js - Huipper Standard Edition",
        description: "Welcome to the next generation of video sharing, completely re-engineered from PHP to Next.js 16 App Router, TypeScript, Tailwind CSS 4, and PostgreSQL.",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
        videoLocation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoType: "video/mp4",
        duration: "09:56",
        views: 1250,
        categoryId: "tech",
        privacy: 0,
        featured: true,
      },
      {
        videoId: "getting-started",
        userId: adminUser.id,
        title: "Getting Started with Content Creation & Streaming",
        description: "Tips and best practices for creating engaging video content, organizing playlists, and growing your subscriber community.",
        thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1280&auto=format&fit=crop&q=80",
        videoLocation: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        videoType: "video/mp4",
        duration: "10:53",
        views: 840,
        categoryId: "education",
        privacy: 0,
        featured: true,
      },
    ]);
  }

  // Site Configuration
  await db
    .insert(siteConfig)
    .values([
      { name: "site_name", value: "PlayTube" },
      { name: "site_title", value: "PlayTube - Video Sharing Platform" },
      { name: "theme", value: "youplay" },
      { name: "upload_system", value: "on" },
    ])
    .onConflictDoNothing({ target: siteConfig.name });

  console.log("Database seeded successfully!");
}

if (require.main === module) {
  seedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
