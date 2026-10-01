import { pool } from "../src/db";

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        video_id INTEGER DEFAULT 0 NOT NULL,
        article_id INTEGER DEFAULT 0 NOT NULL,
        ad_id INTEGER DEFAULT 0 NOT NULL,
        comment_id INTEGER DEFAULT 0 NOT NULL,
        reply_id INTEGER DEFAULT 0 NOT NULL,
        profile_id INTEGER DEFAULT 0 NOT NULL,
        user_id INTEGER DEFAULT 0 NOT NULL,
        text TEXT,
        time TIMESTAMP DEFAULT NOW() NOT NULL,
        seen INTEGER DEFAULT 0 NOT NULL,
        type VARCHAR(100) DEFAULT 'video' NOT NULL
      );

      CREATE TABLE IF NOT EXISTS copyright_report (
        id SERIAL PRIMARY KEY,
        video_id INTEGER DEFAULT 0 NOT NULL,
        user_id INTEGER DEFAULT 0 NOT NULL,
        text TEXT,
        time TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Reports & Copyright Reports tables migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigration();
