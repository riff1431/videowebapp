import { pool } from "../src/db";

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banned (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(100) NOT NULL,
        time TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admininvitations (
        id SERIAL PRIMARY KEY,
        code VARCHAR(300) NOT NULL UNIQUE,
        posted TIMESTAMP DEFAULT NOW() NOT NULL,
        status INTEGER DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invitation_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(300) NOT NULL UNIQUE,
        time TIMESTAMP DEFAULT NOW() NOT NULL,
        invited_id INTEGER DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        text TEXT,
        image TEXT,
        time TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Tools tables migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigration();
