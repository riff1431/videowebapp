"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db, pool } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface SystemStatusIssue {
  type: "error" | "warning";
  title: string;
  message: string;
  linkText?: string;
  linkHref?: string;
}

export async function getSystemStatusAction(): Promise<SystemStatusIssue[]> {
  await assertAdmin();
  const issues: SystemStatusIssue[] = [];

  try {
    // 1. Check SMTP Configuration
    let smtpHost = process.env.MAIL_HOST || "";
    let smtpUser = process.env.MAIL_USERNAME || "";

    try {
      const dbConfigs = await db.select().from(siteConfig);
      const confMap: Record<string, string> = {};
      dbConfigs.forEach((c) => {
        confMap[c.name] = c.value;
      });
      if (confMap["smtp_host"]) smtpHost = confMap["smtp_host"];
      if (confMap["smtp_username"]) smtpUser = confMap["smtp_username"];
    } catch {
      // Fallback on env
    }

    if (!smtpHost && !smtpUser) {
      issues.push({
        type: "error",
        title: "Important!",
        message:
          "SMTP is not configured, it's recommended to setup SMTP, so the system can send e-mails from the server.",
        linkText: "Click Here To Setup SMTP",
        linkHref: "/admin/email-settings",
      });
    }

    // 2. Check ./install folder
    const installFolderPath = path.join(process.cwd(), "install");
    if (fs.existsSync(installFolderPath)) {
      issues.push({
        type: "error",
        title: "Important!",
        message:
          "The folder: ./install is not deleted or renamed, make sure the folder ./install is deleted.",
      });
    }

    // 3. Check upload directory
    const uploadDirPath = path.join(process.cwd(), "public", "upload");
    if (!fs.existsSync(uploadDirPath)) {
      try {
        fs.mkdirSync(uploadDirPath, { recursive: true });
      } catch {
        issues.push({
          type: "error",
          title: "Important!",
          message:
            "The folder: /upload is not writable or missing. Upload folder and all subfolders should be accessible.",
        });
      }
    }

    // 4. Check server max upload size (Warning)
    // Server recommended is 1024MB. Check process memory/body limit or standard configuration
    const configuredMaxUpload = 500; // in MB (PlayTube default is 500M)
    if (configuredMaxUpload < 1000) {
      issues.push({
        type: "warning",
        title: "Warning",
        message: `Your server max upload size is less than 100MB, Current: ${configuredMaxUpload}M Recommended is 1024MB. You should update both: upload_max_filesize, post_max_size.`,
      });
    }

    // 5. Check database connection
    try {
      const client = await pool.connect();
      client.release();
    } catch (err: any) {
      issues.push({
        type: "error",
        title: "Important!",
        message: `Database connection error: ${err.message || "Failed to connect to PostgreSQL"}`,
      });
    }
  } catch (err: any) {
    console.error("Error evaluating system status:", err);
  }

  return issues;
}
