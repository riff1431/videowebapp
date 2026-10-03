"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db, pool } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export interface BackupStatusResponse {
  success: boolean;
  date?: string;
  filename?: string;
  error?: string;
}

export async function getLastBackupDateAction(): Promise<string> {
  await assertAdmin();
  try {
    const configRow = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "last_backup"))
      .limit(1);

    if (configRow.length > 0 && configRow[0].value) {
      return configRow[0].value;
    }
  } catch (err) {
    console.error("Failed to read last_backup config:", err);
  }

  // Format default matching PlayTube date format: DD-MM-YYYY
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}

export async function createBackupAction(): Promise<BackupStatusResponse> {
  await assertAdmin();
  try {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    const dateFormatted = `${d}-${m}-${y}`;
    const timestamp = Math.floor(Date.now() / 1000);

    // Prepare backup folder structure ./script_backups/DD-MM-YYYY/timestamp/
    const backupBaseDir = path.join(process.cwd(), "script_backups");
    const backupDayDir = path.join(backupBaseDir, dateFormatted);
    const backupTargetDir = path.join(backupDayDir, String(timestamp));

    if (!fs.existsSync(backupTargetDir)) {
      fs.mkdirSync(backupTargetDir, { recursive: true });
    }

    // Index safety files
    fs.writeFileSync(path.join(backupBaseDir, "index.html"), "");
    fs.writeFileSync(path.join(backupDayDir, "index.html"), "");
    fs.writeFileSync(path.join(backupTargetDir, "index.html"), "");

    // Export PostgreSQL schema and metadata
    let sqlDump = `-- PlayTube Next.js PostgreSQL Backup\n`;
    sqlDump += `-- Generation Date: ${dateFormatted} at ${now.toLocaleTimeString()}\n`;
    sqlDump += `-- Database: PostgreSQL 16+\n\n`;

    // Query tables list from current schema
    const client = await pool.connect();
    try {
      const tablesRes = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;`
      );

      for (const row of tablesRes.rows) {
        const tableName = row.table_name;
        sqlDump += `-- ---------------------------------------------------------\n`;
        sqlDump += `-- Table data: "${tableName}"\n`;
        sqlDump += `-- ---------------------------------------------------------\n`;

        const dataRes = await client.query(`SELECT * FROM "${tableName}" LIMIT 500;`);
        if (dataRes.rows.length > 0) {
          const columns = Object.keys(dataRes.rows[0]);
          for (const item of dataRes.rows) {
            const values = columns.map((col) => {
              const val = item[col];
              if (val === null || val === undefined) return "NULL";
              if (typeof val === "number" || typeof val === "boolean") return String(val);
              if (val instanceof Date) return `'${val.toISOString()}'`;
              if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              return `'${String(val).replace(/'/g, "''")}'`;
            });
            sqlDump += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(", ")});\n`;
          }
        }
        sqlDump += `\n`;
      }
    } finally {
      client.release();
    }

    const sqlFileName = `SQL-Backup-${timestamp}-${dateFormatted}.sql`;
    fs.writeFileSync(path.join(backupTargetDir, sqlFileName), sqlDump, "utf-8");

    // Update last_backup in site config
    await db
      .insert(siteConfig)
      .values({
        name: "last_backup",
        value: dateFormatted,
      })
      .onConflictDoUpdate({
        target: siteConfig.name,
        set: { value: dateFormatted },
      });

    revalidatePath("/admin/backup");

    return {
      success: true,
      date: dateFormatted,
      filename: sqlFileName,
    };
  } catch (err: any) {
    console.error("Backup creation failed:", err);
    return {
      success: false,
      error: err.message || "Failed to create backup",
    };
  }
}
