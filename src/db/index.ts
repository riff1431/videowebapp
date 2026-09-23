import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const isLocal =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.DATABASE_URL?.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocal && (process.env.DATABASE_URL?.includes("supabase.co") || process.env.DATABASE_URL?.includes("pooler") || process.env.NODE_ENV === "production")
    ? { rejectUnauthorized: false }
    : false,
});



export const db = drizzle(pool, { schema });
export { pool };
