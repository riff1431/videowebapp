import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bank_receipts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receipt_img TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      mode VARCHAR(50) DEFAULT 'wallet',
      status INTEGER DEFAULT 0,
      approved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS video_ads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'video',
      ad_media TEXT NOT NULL,
      ad_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 10,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS website_ads (
      id SERIAL PRIMARY KEY,
      placement VARCHAR(100) NOT NULL UNIQUE,
      code TEXT DEFAULT '',
      active BOOLEAN DEFAULT true,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_ads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      target_audience VARCHAR(100) DEFAULT 'All',
      placement VARCHAR(100) DEFAULT 'Videos (Format Video / Image)',
      pricing VARCHAR(50) DEFAULT 'cpc',
      day_limit DOUBLE PRECISION DEFAULT 0,
      total_limit DOUBLE PRECISION DEFAULT 0,
      media_url TEXT,
      status INTEGER DEFAULT 1,
      clicks INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      spent DOUBLE PRECISION DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DOUBLE PRECISION NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      paypal_email VARCHAR(255),
      status INTEGER DEFAULT 0,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS currencies (
      id SERIAL PRIMARY KEY,
      currency_code VARCHAR(10) NOT NULL UNIQUE,
      currency_symbol VARCHAR(10) NOT NULL,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    INSERT INTO currencies (currency_code, currency_symbol, is_default)
    VALUES
      ('USD', '$', true),
      ('EUR', '€', false),
      ('JPY', '¥', false),
      ('TRY', '₺', false),
      ('GBP', '£', false),
      ('RUB', 'руб', false),
      ('PLN', 'zł', false),
      ('ILS', '₪', false),
      ('BRL', 'R$', false),
      ('INR', '₹', false)
    ON CONFLICT (currency_code) DO NOTHING;
  `);

  console.log("Migration executed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
