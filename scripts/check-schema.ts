import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://playtube:playtubepassword@localhost:5432/playtube"
});
const db = drizzle(pool);

async function check() {
  const r = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';`);
  console.log("Users:", r.rows);
  const s = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sessions';`);
  console.log("Sessions:", s.rows);
  const a = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts';`);
  console.log("Accounts:", a.rows);
  await pool.end();
}
check();
