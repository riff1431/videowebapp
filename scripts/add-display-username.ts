import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://playtube:playtubepassword@localhost:5432/playtube"
});

async function addDisplayUsername() {
  await pool.query(`
    ALTER TABLE "users" 
    ADD COLUMN IF NOT EXISTS "display_username" varchar(255);
  `);
  console.log("display_username column added successfully!");
  await pool.end();
}
addDisplayUsername().catch(console.error);
