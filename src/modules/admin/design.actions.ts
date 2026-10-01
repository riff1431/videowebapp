"use server";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// ==========================================
// Custom Design Actions (header_js, footer_js, header_css)
// ==========================================

export async function getCustomDesignAction() {
  try {
    const configs = await db
      .select()
      .from(siteConfig)
      .where(inArray(siteConfig.name, ["header_js", "footer_js", "header_css"]));

    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.name] = c.value || "";
    }

    return {
      success: true,
      data: {
        headerJs: map["header_js"] || "",
        footerJs: map["footer_js"] || "",
        headerCss: map["header_css"] || "",
      },
    };
  } catch (error: any) {
    console.error("getCustomDesignAction error:", error);
    return {
      success: false,
      data: { headerJs: "", footerJs: "", headerCss: "" },
    };
  }
}

export async function saveCustomDesignAction(data: {
  headerJs: string;
  footerJs: string;
  headerCss: string;
}) {
  try {
    const entries = [
      { name: "header_js", value: data.headerJs },
      { name: "footer_js", value: data.footerJs },
      { name: "header_css", value: data.headerCss },
    ];

    for (const entry of entries) {
      const existing = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.name, entry.name))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteConfig)
          .set({ value: entry.value })
          .where(eq(siteConfig.name, entry.name));
      } else {
        await db.insert(siteConfig).values({
          name: entry.name,
          value: entry.value,
        });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/custom-design");

    return { success: true, message: "Custom design saved successfully!" };
  } catch (error: any) {
    console.error("saveCustomDesignAction error:", error);
    return { success: false, message: error.message || "Failed to save custom design" };
  }
}

// ==========================================
// Change Site Design Actions (Logo, Favicon, Night Mode)
// ==========================================

export async function getSiteDesignSettingsAction() {
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
        nightMode: map["night_mode"] || "night_default", // both | night_default | night | light
      },
    };
  } catch (error: any) {
    console.error("getSiteDesignSettingsAction error:", error);
    return {
      success: false,
      data: {
        favicon: "/favicon.ico",
        logo: "/logo.png",
        lightLogo: "/logo-light.png",
        nightMode: "night_default",
      },
    };
  }
}

export async function saveSiteDesignSettingsAction(data: {
  nightMode: string;
}) {
  try {
    const existing = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "night_mode"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteConfig)
        .set({ value: data.nightMode })
        .where(eq(siteConfig.name, "night_mode"));
    } else {
      await db.insert(siteConfig).values({
        name: "night_mode",
        value: data.nightMode,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/change-site-desgin");

    return { success: true, message: "Design settings saved successfully!" };
  } catch (error: any) {
    console.error("saveSiteDesignSettingsAction error:", error);
    return { success: false, message: error.message || "Failed to save design settings" };
  }
}

export async function uploadDesignAssetAction(formData: FormData) {
  try {
    const type = formData.get("type") as string; // "favicon" | "logo" | "light_logo"
    const file = formData.get("file") as File | null;

    if (!file || !type) {
      return { success: false, message: "File and asset type are required" };
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload dir exists
    const uploadsDir = path.join(process.cwd(), "public", "upload", "design");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate safe filename
    const ext = path.extname(file.name) || ".png";
    const filename = `${type}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/upload/design/${filename}`;

    // Update DB
    const existing = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, type))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteConfig)
        .set({ value: publicUrl })
        .where(eq(siteConfig.name, type));
    } else {
      await db.insert(siteConfig).values({
        name: type,
        value: publicUrl,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/change-site-desgin");

    return {
      success: true,
      message: `${type} uploaded successfully!`,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error("uploadDesignAssetAction error:", error);
    return { success: false, message: error.message || "Upload failed" };
  }
}

// ==========================================
// Themes Actions (Default, YouPlay)
// ==========================================

export async function getThemesAction() {
  try {
    const activeConfig = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "theme"))
      .limit(1);

    const activeTheme = activeConfig.length > 0 ? activeConfig[0].value : "default";

    return {
      success: true,
      activeTheme: activeTheme || "default",
      themes: [
        {
          key: "default",
          name: "Default",
          version: "1.0",
          author: "Deen Doughouz",
          authorUrl: "https://codecanyon.net/user/doughouzlight",
        },
        {
          key: "youplay",
          name: "YouPlay",
          version: "1.0",
          author: "Deen Doughouz",
          authorUrl: "https://codecanyon.net/user/doughouzlight",
        },
      ],
      thirdPartyThemes: [
        {
          name: "Playtag - The Ultimate Theme",
          logo: "https://s3.envato.com/files/460158656/logo.png",
          url: "https://bit.ly/PlaytagTheme",
        },
        {
          name: "Vidplay - The Elegant Theme",
          logo: "https://s3.envato.com/files/268008739/logo.png",
          url: "https://bit.ly/VPlayTheme",
        },
      ],
    };
  } catch (error: any) {
    console.error("getThemesAction error:", error);
    return {
      success: false,
      activeTheme: "default",
      themes: [],
      thirdPartyThemes: [],
    };
  }
}

export async function activateThemeAction(themeKey: string) {
  try {
    const existing = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "theme"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteConfig)
        .set({ value: themeKey })
        .where(eq(siteConfig.name, "theme"));
    } else {
      await db.insert(siteConfig).values({
        name: "theme",
        value: themeKey,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/manage-themes");

    return { success: true, message: `Theme ${themeKey} activated successfully!` };
  } catch (error: any) {
    console.error("activateThemeAction error:", error);
    return { success: false, message: error.message || "Failed to activate theme" };
  }
}
