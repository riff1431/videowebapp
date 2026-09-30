import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://playtube:playtubepassword@localhost:5432/playtube"
});

async function fixAccountsId() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ALTER TABLE "accounts" 
      ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp,
      ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp,
      ADD COLUMN IF NOT EXISTS "scope" text;
    ALTER TABLE "accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
    ALTER TABLE "verifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
  `);
  console.log("Accounts columns and id defaults updated successfully!");
  await pool.end();
}
fixAccountsId().catch(console.error);
