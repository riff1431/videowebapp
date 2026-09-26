import { Pool } from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Read database URL from .env if not already in process.env
const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://playtube:playtubepassword@localhost:5432/playtube";

async function resetAndSeed() {
  console.log("=== PlayTube Database Reset & Seed ===");
  console.log(`Target database URL: ${dbUrl.replace(/:[^:@]+@/, ":****@")}`);

  const pool = new Pool({
    connectionString: dbUrl,
    ssl:
      dbUrl.includes("supabase.co") || dbUrl.includes("pooler")
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    const client = await pool.connect();
    console.log("[OK] Connected to PostgreSQL");

    // 1. Drop public schema with CASCADE and recreate it
    console.log("Resetting full schema (DROP SCHEMA public CASCADE)...");
    await client.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO PUBLIC;
      COMMENT ON SCHEMA public IS 'standard public schema';
    `);
    console.log("[OK] Public schema reset cleanly.");

    // 2. Run initial SQL migration
    const migrationFile = resolve("src/db/migrations/0000_raw.sql");
    if (existsSync(migrationFile)) {
      console.log("Applying initial schema migration (0000_raw.sql)...");
      const sql = readFileSync(migrationFile, "utf-8");
      await client.query(sql);
      console.log("[OK] Schema created successfully.");
    } else {
      throw new Error(`Migration file not found at ${migrationFile}`);
    }

    client.release();
    await pool.end();

    // 3. Seed database (default categories, admin with password, initial videos, config)
    console.log("Running seedDatabase with admin account...");
    const { seedDatabase } = await import("../src/db/seed/seed");
    await seedDatabase();

    console.log("==================================================");
    console.log("[SUCCESS] Full DB reset and seed completed!");
    console.log("Admin credentials:");
    console.log("  Username: admin");
    console.log("  Email:    admin@playtube.local");
    console.log("  Password: admin");
    console.log("==================================================");
    process.exit(0);
  } catch (err: any) {
    console.error("[FAIL] Error during reset and seed:", err);
    process.exit(1);
  }
}

resetAndSeed();
