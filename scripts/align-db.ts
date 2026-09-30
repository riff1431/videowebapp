import { pool } from "../src/db";

async function inspectAndMigrate() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'videos'"
    );
    const existingCols = res.rows.map((r) => r.column_name);
    console.log("Existing columns in 'videos':", existingCols);

    // List of new movie columns
    const columnsToAdd = [
      { name: "is_movie", type: "boolean DEFAULT false" },
      { name: "movie_release", type: "varchar(50)" },
      { name: "rating", type: "double precision DEFAULT 0" },
      { name: "stars", type: "text" },
      { name: "producer", type: "varchar(255)" },
      { name: "country", type: "varchar(100)" },
      { name: "quality", type: "varchar(50) DEFAULT 'HD'" },
    ];

    for (const col of columnsToAdd) {
      if (!existingCols.includes(col.name)) {
        console.log(`Adding missing column '${col.name}' to 'videos'...`);
        await client.query(`ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
        console.log(`[OK] Added column '${col.name}'`);
      }
    }

    // Also verify all new tables exist in Postgres
    console.log("Checking articles table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "articles" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "text" text NOT NULL,
        "category" varchar(100) DEFAULT 'general',
        "image" varchar(500) DEFAULT '/upload/photos/d-cover.jpg',
        "tags" varchar(500) DEFAULT '',
        "views" integer DEFAULT 0,
        "shared" integer DEFAULT 0,
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("Checking article_comments table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "article_comments" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "article_id" integer NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
        "text" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("Checking transactions table...");
    await client.query(`
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
    `);

    console.log("Checking messages table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" serial PRIMARY KEY NOT NULL,
        "from_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "to_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "text" text NOT NULL,
        "seen" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("Checking activities table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "video_id" integer REFERENCES "videos"("id") ON DELETE CASCADE,
        "type" varchar(50) NOT NULL,
        "text" text,
        "image" text,
        "time" timestamp DEFAULT now() NOT NULL
      );
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "text" text;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "image" text;
    `);

    console.log("Checking announcements table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" serial PRIMARY KEY NOT NULL,
        "text" text NOT NULL,
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("All tables and columns successfully verified & aligned in PostgreSQL!");
  } catch (err: any) {
    console.error("Migration error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inspectAndMigrate();
