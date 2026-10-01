import { pool } from "../src/db";

async function run() {
  console.log("Creating language_translations table and updating languages...");
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE languages 
      ADD COLUMN IF NOT EXISTS display_name varchar(100),
      ADD COLUMN IF NOT EXISTS direction varchar(10) DEFAULT 'ltr' NOT NULL,
      ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

      CREATE TABLE IF NOT EXISTS language_translations (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL,
        lang VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS lang_translations_key_lang_idx 
      ON language_translations (key, lang);

      CREATE INDEX IF NOT EXISTS lang_translations_lang_idx 
      ON language_translations (lang);
    `);
    console.log("[OK] Schema updated successfully in PostgreSQL!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
