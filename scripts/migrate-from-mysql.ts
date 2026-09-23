import fs from "fs";
import path from "path";
import { db, pool } from "../src/db";
import { siteConfig } from "../src/db/schema";

/**
 * Migration ETL script to import legacy PlayTube MySQL data into PostgreSQL.
 * Reads existing-videowebsite/Script/playtube.sql config and data.
 */
export async function migrateFromMysqlDump() {
  console.log("=========================================");
  console.log("  PLAYTUBE MySQL -> PostgreSQL ETL TOOL  ");
  console.log("=========================================\n");

  const dumpPath = path.resolve(process.cwd(), "existing-videowebsite/Script/playtube.sql");
  if (!fs.existsSync(dumpPath)) {
    console.error(`[ERROR] Dump file not found at: ${dumpPath}`);
    return;
  }

  console.log(`[1/3] Reading SQL dump file: ${dumpPath}`);
  const content = fs.readFileSync(dumpPath, "utf-8");

  // 1. Extract Config values
  console.log("[2/3] Extracting legacy config settings...");
  const headerMarker = "INSERT INTO " + String.fromCharCode(96) + "config" + String.fromCharCode(96);
  const startIdx = content.indexOf(headerMarker);
  let importedCount = 0;

  if (startIdx !== -1) {
    const endIdx = content.indexOf(";\r\n", startIdx) !== -1 
      ? content.indexOf(";\r\n", startIdx) 
      : content.indexOf(";\n", startIdx);
    
    const configChunk = content.slice(startIdx, endIdx !== -1 ? endIdx : undefined);
    const lines = configChunk.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      // Format: (1, 'theme', 'youplay'),
      const m = line.match(/^\(\s*\d+\s*,\s*'([^']+)'\s*,\s*'([\s\S]*?)'\s*\)[,;]?$/);
      if (m) {
        const name = m[1].trim();
        const value = m[2].trim();

        try {
          await db
            .insert(siteConfig)
            .values({ name, value })
            .onConflictDoUpdate({
              target: siteConfig.name,
              set: { value },
            });
          importedCount++;
        } catch (e: any) {
          console.error(`Error inserting key ${name}:`, e.message);
        }
      }
    }
  }

  console.log(`[OK] Successfully imported ${importedCount} config keys into site_config.`);
  console.log("[3/3] Migration completed successfully.\n");
}

if (require.main === module || process.argv[1]?.includes("migrate-from-mysql")) {
  migrateFromMysqlDump()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[FATAL] Migration failed:", err);
      process.exit(1);
    });
}
