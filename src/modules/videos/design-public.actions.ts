"use server";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function getPublicDesignSettingsAction() {
  try {
    const configs = await db
      .select()
      .from(siteConfig)
      .where(
        inArray(siteConfig.name, [
          "favicon",
          "logo",
          "light_logo",
          "night_mode",
          "active_theme",
          "theme",
        ])
      );

    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.name] = c.value || "";
    }

    return {
      success: true,
      data: {
        favicon: map["favicon"] || "/favicon.ico",
        logo: map["logo"] || "/logo.png",
        lightLogo: map["light_logo"] || "/logo-light.png",
        nightMode: map["night_mode"] || "night_default",
        theme: map["active_theme"] || map["theme"] || "youplay",
      },
    };
  } catch (error: any) {
    console.error("getPublicDesignSettingsAction error:", error);
    return {
      success: false,
      data: {
        favicon: "/favicon.ico",
        logo: "/logo.png",
        lightLogo: "/logo-light.png",
        nightMode: "night_default",
        theme: "youplay",
      },
    };
  }
}
