import { pool } from "../src/db";

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_pages (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(150) NOT NULL UNIQUE,
        page_title VARCHAR(255) NOT NULL,
        page_content TEXT NOT NULL,
        page_type INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL,
        time TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS terms_pages (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100) NOT NULL UNIQUE,
        enabled INTEGER DEFAULT 1 NOT NULL,
        translations TEXT DEFAULT '{}' NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Pages & FAQs tables verified/created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

runMigration();
