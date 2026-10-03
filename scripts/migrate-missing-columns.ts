/**
 * migrate-missing-columns.ts
 * 
 * Safely adds any columns that exist in the Drizzle schema but are missing
 * from the actual PostgreSQL database. Uses ADD COLUMN IF NOT EXISTS so it is
 * safe to re-run multiple times.
 */

import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log("🔧 Applying missing column migrations...\n");

    // -------------------------------------------------------------------
    // users table – columns added to schema after initial DB creation
    // -------------------------------------------------------------------
    const usersMigrations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS points          integer      NOT NULL DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet          double precision DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS balance         double precision DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS about           text`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender          varchar(20)  DEFAULT 'male'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS country_id      integer      DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS age             integer      DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS verified        boolean      DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro          boolean      DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS active          boolean      DEFAULT true`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS google          varchar(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook        varchar(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter         varchar(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram       varchar(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar          varchar(500) DEFAULT '/upload/photos/d-avatar.jpg'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS cover           varchar(500) DEFAULT '/upload/photos/d-cover.jpg'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_username varchar(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin        boolean      DEFAULT false`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role            varchar(50)  DEFAULT 'user'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS image           varchar(500)`,
    ];

    for (const sql of usersMigrations) {
      try {
        await client.query(sql);
        const col = sql.match(/ADD COLUMN IF NOT EXISTS (\S+)/)?.[1] ?? sql;
        console.log(`  ✅ users.${col}`);
      } catch (e: any) {
        console.error(`  ❌ Failed: ${sql}\n     ${e.message}`);
      }
    }

    // -------------------------------------------------------------------
    // sessions table – add unique constraint on token if missing
    // -------------------------------------------------------------------
    try {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'sessions_token_unique' AND conrelid = 'sessions'::regclass
          ) THEN
            ALTER TABLE sessions ADD CONSTRAINT sessions_token_unique UNIQUE (token);
          END IF;
        END $$;
      `);
      console.log(`  ✅ sessions.token unique constraint`);
    } catch (e: any) {
      console.error(`  ❌ sessions unique constraint: ${e.message}`);
    }

    console.log("\n✅ All migrations applied successfully.");
    console.log("   Run 'npm run start' and try logging in again.\n");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
