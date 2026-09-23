import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// In CLI scripts (tsx), Next.js environment loader isn't active by default.
// Load .env variables if process.env.DATABASE_URL is not populated.
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors loading .env in production container environments
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://playtube:playtubepassword@localhost:5432/playtube";

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: !isLocal && (connectionString.includes("supabase.co") || connectionString.includes("pooler") || process.env.NODE_ENV === "production")
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });
export { pool };
