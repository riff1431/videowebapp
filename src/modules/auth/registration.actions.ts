"use server";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";

/**
 * Public action to retrieve registration policy for the client signup page.
 * Returns { registrationEnabled: boolean, inviteOnly: boolean }
 */
export async function getRegistrationStatusAction(): Promise<{
  registrationEnabled: boolean;
  inviteOnly: boolean;
}> {
  try {
    const rows = await db
      .select({ name: siteConfig.name, value: siteConfig.value })
      .from(siteConfig)
      .where(inArray(siteConfig.name, ["user_registration", "invite_links_system"]));

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.name] = r.value;
    }

    const regValue = map["user_registration"] ?? "on";
    const inviteValue = map["invite_links_system"] ?? "off";

    return {
      registrationEnabled: regValue === "on",
      inviteOnly: regValue === "off" || inviteValue === "on",
    };
  } catch (err) {
    console.error("Failed to get registration status:", err);
    return {
      registrationEnabled: true,
      inviteOnly: false,
    };
  }
}
