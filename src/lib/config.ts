import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Internal fetcher for config keys from PostgreSQL siteConfig table
 */
async function fetchConfigKeys(keys: string[]): Promise<Record<string, string>> {
  if (!keys || keys.length === 0) return {};

  try {
    const rows = await db
      .select({ name: siteConfig.name, value: siteConfig.value })
      .from(siteConfig)
      .where(inArray(siteConfig.name, keys));

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.name] = row.value;
    }
    return map;
  } catch (err) {
    console.error("Failed to load site config keys:", keys, err);
    return {};
  }
}

/**
 * Cached helper to retrieve configuration keys from the database.
 * Uses unstable_cache tagged with "site-config" so admin mutations
 * can revalidate immediately via revalidateTag("site-config").
 */
export async function getSiteConfig(keys: string[]): Promise<Record<string, string>> {
  const getCached = unstable_cache(
    async (keyList: string[]) => fetchConfigKeys(keyList),
    ["site-config-keys", keys.sort().join(",")],
    {
      tags: ["site-config"],
      revalidate: 60, // 60s cache fallback
    }
  );

  return getCached(keys);
}
