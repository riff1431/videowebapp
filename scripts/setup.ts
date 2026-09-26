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
