import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating manage_pro and payments tables...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS manage_pro (
      id SERIAL PRIMARY KEY,
      type VARCHAR(100) NOT NULL DEFAULT '',
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      featured_videos INTEGER NOT NULL DEFAULT 0,
      verified_badge INTEGER NOT NULL DEFAULT 0,
      discount INTEGER NOT NULL DEFAULT 0,
      image TEXT DEFAULT '',
      night_image TEXT DEFAULT '',
      color VARCHAR(50) NOT NULL DEFAULT '#2216C5',
      description TEXT DEFAULT '',
      status INTEGER NOT NULL DEFAULT 1,
      time VARCHAR(20) NOT NULL DEFAULT 'month',
      time_count INTEGER NOT NULL DEFAULT 1,
      max_upload VARCHAR(100) NOT NULL DEFAULT '96000000',
      features TEXT DEFAULT '{}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL DEFAULT 0,
      type VARCHAR(200) NOT NULL DEFAULT 'pro',
      amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      date VARCHAR(100) NOT NULL DEFAULT '',
      expire VARCHAR(30) NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Check if manage_pro has default package
  const rows: any = await db.execute(sql`SELECT count(*) as count FROM manage_pro`);
  if (parseInt(rows[0]?.count || "0", 10) === 0) {
    console.log("Seeding default PRO package...");
    await db.execute(sql`
      INSERT INTO manage_pro (
        id, type, price, featured_videos, verified_badge, discount, image, night_image, color, description, status, time, time_count, max_upload, features
      ) VALUES (
        1, 'PRO', 10, 1, 1, 0, '', '', '#2216C5', 'Standard Pro Membership package with all features unlocked.', 1, 'month', 1, '96000000', '{"can_use_pro_google":"pro"}'
      )
  }

  // Ensure sequence is properly synchronized
  await db.execute(sql`
    SELECT setval('manage_pro_id_seq', (SELECT COALESCE(MAX(id), 1) FROM manage_pro));
  `);

  // Ensure config keys exist in site_config
  const configs = [
    { name: "go_pro", value: "on" },
    { name: "require_subcription", value: "off" },
    { name: "pro_google", value: "on" },
    { name: "who_can_pro_google", value: "all" },
    { name: "pro_pkg_price", value: "10" },
    { name: "user_max_import", value: "100" },
    { name: "max_upload_free_users", value: "1000000000" }, // 1GB
    { name: "max_upload_pro_users", value: "1000000000" }, // 1GB
  ];

  for (const cfg of configs) {
    await db.execute(sql`
      INSERT INTO config (name, value)
      VALUES (${cfg.name}, ${cfg.value})
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  console.log("manage_pro and payments migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
