import { Pool } from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

async function setup() {
  console.log("=== PlayTube Customer Installer (Huipper Standard) ===");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("[ERROR] DATABASE_URL is not defined in environment.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("supabase.co") || dbUrl.includes("pooler")
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    const client = await pool.connect();
    console.log("[OK] Database connected");

    const migrationFile = resolve("src/db/migrations/0000_raw.sql");
    if (existsSync(migrationFile)) {
      try {
        const sql = readFileSync(migrationFile, "utf-8");
        await client.query(sql);
        console.log("[OK] Migrations completed");
      } catch (migErr: any) {
        if (migErr.code === "42P07") {
          console.log("[OK] Schema already exists, skipping initial table creation");
        } else {
          console.warn("[WARN] Migration notice:", migErr.message || migErr);
        }
      }

      // Ensure Better Auth parity columns, defaults, and all parity tables exist
      try {
        await client.query(`
          ALTER TABLE "accounts" 
            ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp,
            ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp,
            ADD COLUMN IF NOT EXISTS "scope" text;
          ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
          ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
          ALTER TABLE "verifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

          CREATE TABLE IF NOT EXISTS "articles" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "title" varchar(255) NOT NULL,
            "description" text NOT NULL,
            "text" text NOT NULL,
            "category" varchar(100) DEFAULT 'general',
            "image" text DEFAULT '/upload/photos/d-cover.jpg',
            "tags" text DEFAULT '',
            "views" integer DEFAULT 0,
            "shared" integer DEFAULT 0,
            "active" boolean DEFAULT true,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );
          ALTER TABLE "articles" ALTER COLUMN "image" TYPE text;
          ALTER TABLE "articles" ALTER COLUMN "tags" TYPE text;
          ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "license" varchar(100) DEFAULT 'Royalty Free License (RF)';

          CREATE TABLE IF NOT EXISTS "article_comments" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "article_id" integer NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
            "text" text NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "transactions" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "type" varchar(50) NOT NULL,
            "amount" double precision NOT NULL,
            "currency" varchar(10) DEFAULT 'USD',
            "status" varchar(50) DEFAULT 'completed',
            "description" text,
            "created_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "messages" (
            "id" serial PRIMARY KEY NOT NULL,
            "from_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "to_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "text" text NOT NULL,
            "seen" boolean DEFAULT false,
            "created_at" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "activities" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "video_id" integer REFERENCES "videos"("id") ON DELETE CASCADE,
            "type" varchar(50) NOT NULL,
            "time" timestamp DEFAULT now() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS "announcements" (
            "id" serial PRIMARY KEY NOT NULL,
            "text" text NOT NULL,
            "active" boolean DEFAULT true,
            "created_at" timestamp DEFAULT now() NOT NULL
          );
        `);
      } catch (e: any) {
        // Ignored if already configured
      }
    }

    client.release();
    await pool.end();

    const { seedDatabase } = await import("../src/db/seed/seed");
    await seedDatabase();

    console.log("[OK] Roles, categories, and administrator created");
    console.log("[OK] Installation completed successfully!");
  } catch (err: any) {
    console.error("[FAIL] Setup failed:", err.message || err);
    process.exit(1);
  }
}

setup();
