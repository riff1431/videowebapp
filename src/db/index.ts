import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const isRemote =
  process.env.DATABASE_URL?.includes("supabase.co") ||
  process.env.DATABASE_URL?.includes("pooler") ||
  process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});


export const db = drizzle(pool, { schema });
export { pool };
