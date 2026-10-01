import { pool } from "../src/db";

async function main() {
  const client = await pool.connect();
  try {
    console.log("Checking categories table...");
    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS translations TEXT DEFAULT '{}';
    `);

    console.log("Creating sub_categories table if not exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id SERIAL PRIMARY KEY,
        category_key VARCHAR(100) NOT NULL,
        key VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        translations TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sub_cat_parent_idx ON sub_categories (category_key);
    `);

    console.log("Schema update complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
