import { db } from "@/db";
import { siteConfig, users, managePro } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";

export interface UserUploadLimitInfo {
  canUpload: boolean;
  maxUploadBytes: number; // 0 means unlimited
  maxUploadFormatted: string;
  whoCanUpload: "all" | "admin" | "pro";
  uploadSystemEnabled: boolean;
  isAdmin: boolean;
  isPro: boolean;
  maxDurationSeconds: number;
}

function parseBytes(val: string | number | undefined | null): number {
  if (!val) return 1000000000; // default 1GB
  const str = String(val).trim().toUpperCase();
  if (str === "0" || str === "UNLIMITED") return 0; // 0 means unlimited
  if (str.endsWith("KB") || str.endsWith("K")) {
    return (parseFloat(str) || 0) * 1024;
  }
  if (str.endsWith("MB") || str.endsWith("M")) {
    return (parseFloat(str) || 0) * 1024 * 1024;
  }
  if (str.endsWith("GB") || str.endsWith("G")) {
    return (parseFloat(str) || 0) * 1024 * 1024 * 1024;
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 1000000000 : parsed;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "Unlimited";
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)}GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)}KB`;
  }
  return `${bytes}B`;
}

/**
 * Calculates effective upload limit and permissions for a given user.
 * Rule:
 * 1. Admin: always allowed, max_upload or unlimited.
 * 2. who_can_upload: "all" (all users), "admin" (only admins), "pro" (only pro or admins).
 * 3. Pro user -> manage_pro max_upload (or max_upload_pro_users), otherwise max_upload_all_users.
 */
export async function getUserUploadLimit(userId?: number | null): Promise<UserUploadLimitInfo> {
  const config = await getSiteConfig([
    "who_can_upload",
    "upload_system",
    "max_upload_all_users",
    "max_upload_pro_users",
    "max_upload_free_users",
    "max_upload",
    "max_video_duration",
  ]);

  const whoCanUpload = (config["who_can_upload"] || "all") as "all" | "admin" | "pro";
  const uploadSystemEnabled = (config["upload_system"] ?? "on") !== "off";

  let isAdmin = false;
  let isPro = false;
  let proMaxUploadBytes: number | null = null;

  if (userId) {
    const [u] = await db
      .select({
        role: users.role,
        isAdmin: users.isAdmin,
        isPro: users.isPro,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (u) {
      isAdmin = u.isAdmin ?? u.role === "admin";
      isPro = u.isPro ?? false;
    }

    if (isPro) {
      // Check package limits from managePro
      const [proPkg] = await db
        .select({ maxUpload: managePro.maxUpload })
        .from(managePro)
        .where(eq(managePro.status, 1))
        .limit(1);

      if (proPkg?.maxUpload) {
        proMaxUploadBytes = parseBytes(proPkg.maxUpload);
      }
    }
  }

  // Determine canUpload
  let canUpload = uploadSystemEnabled;
  if (!uploadSystemEnabled && !isAdmin) {
    canUpload = false;
  } else if (whoCanUpload === "admin" && !isAdmin) {
    canUpload = false;
  } else if (whoCanUpload === "pro" && !isPro && !isAdmin) {
    canUpload = false;
  }

  // Determine max upload size
  let effectiveBytes: number;
  if (isAdmin) {
    // Admin uses max_upload or unlimited
    effectiveBytes = parseBytes(config["max_upload"] || config["max_upload_all_users"] || "1000000000");
  } else if (isPro) {
    effectiveBytes =
      proMaxUploadBytes ??
      parseBytes(config["max_upload_pro_users"] || config["max_upload"] || "1000000000");
  } else {
    // Free user
    effectiveBytes = parseBytes(
      config["max_upload_all_users"] ||
      config["max_upload_free_users"] ||
      config["max_upload"] ||
      "1000000000"
    );
  }

  const durationSec = parseInt(config["max_video_duration"] || "15", 10) || 15;

  return {
    canUpload,
    maxUploadBytes: effectiveBytes,
    maxUploadFormatted: formatBytes(effectiveBytes),
    whoCanUpload,
    uploadSystemEnabled,
    isAdmin,
    isPro,
    maxDurationSeconds: durationSec,
  };
}
