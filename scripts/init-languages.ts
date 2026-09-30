import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS languages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      iso VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS language_keys (
      id SERIAL PRIMARY KEY,
      key_name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Seed default 20 languages if empty
  const existing = await db.execute(sql`SELECT count(*) FROM languages;`);
  const count = Number(existing.rows[0]?.count || 0);

  if (count === 0) {
    const initialLangs = [
      { name: "English", iso: "en" },
      { name: "Arabic", iso: "ar" },
      { name: "Dutch", iso: "nl" },
      { name: "French", iso: "fr" },
      { name: "German", iso: "de" },
      { name: "Russian", iso: "ru" },
      { name: "Spanish", iso: "es" },
      { name: "Turkish", iso: "tr" },
      { name: "Hindi", iso: "hi" },
      { name: "Chinese", iso: "zh" },
      { name: "Urdu", iso: "ur" },
      { name: "Indonesian", iso: "id" },
      { name: "Croatian", iso: "hr" },
      { name: "Hebrew", iso: "he" },
      { name: "Bengali", iso: "bn" },
      { name: "Japanese", iso: "ja" },
      { name: "Portuguese", iso: "pt" },
      { name: "Italian", iso: "it" },
      { name: "Persian", iso: "fa" },
      { name: "Swedish", iso: "sv" },
      { name: "Vietnamese", iso: "vi" },
      { name: "Danish", iso: "da" },
      { name: "Filipino", iso: "tl" },
    ];

    for (const lang of initialLangs) {
      await db.execute(sql`
        INSERT INTO languages (name, iso, status)
        VALUES (${lang.name}, ${lang.iso}, 'active')
        ON CONFLICT (name) DO NOTHING;
      `);
    }
  }

  console.log("Languages table ready and seeded!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
