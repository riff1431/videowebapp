import { pool, db } from "../src/db";
import { categories } from "../src/db/schema";

async function main() {
  const result = await db.select().from(categories);
  console.log("Categories in DB (" + result.length + "):");
  console.log(JSON.stringify(result, null, 2));
  await pool.end();
}

main().catch(console.error);
