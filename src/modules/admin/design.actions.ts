"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

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
  await assertAdmin();
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
  await assertAdmin();
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
  await assertAdmin();
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
        nightMode: map["night_mode"] || "night_default", // both | night_default | night | light
        theme: map["theme"] || "youplay",
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
        theme: "youplay",
      },
    };
  }
}

export async function saveSiteDesignSettingsAction(data: {
  nightMode: string;
}) {
  await assertAdmin();
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
  await assertAdmin();
  try {
    const type = formData.get("type") as string; // "favicon" | "logo" | "light_logo"
    const file = formData.get("file") as File | null;

    if (!file || !type) {
      return { success: false, message: "File and asset type are required" };
    }

    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename
    const ext = path.extname(file.name) || ".png";
    const filename = `${type}_${Date.now()}${ext}`;

    let publicUrl = "";

    // Always ensure local file is written so local dev and /upload/design/... paths resolve
    const uploadsDir = path.join(process.cwd(), "public", "upload", "design");
    await fs.mkdir(uploadsDir, { recursive: true });
    const localFilePath = path.join(uploadsDir, filename);
    await fs.writeFile(localFilePath, buffer);
    publicUrl = `/upload/design/${filename}`;

    // If STORAGE_DRIVER is supabase, also upload to Supabase Storage for remote hosting
    const isSupabaseDriver =
      process.env.STORAGE_DRIVER === "supabase" ||
      (!process.env.STORAGE_DRIVER && !!process.env.NEXT_PUBLIC_SUPABASE_URL);

    if (isSupabaseDriver) {
      try {
        const { uploadToSupabaseStorage } = await import("@/lib/storage/supabase");
        const supabaseRes = await uploadToSupabaseStorage(
          "playtube-uploads",
          `design/${filename}`,
          buffer,
          file.type || "image/png"
        );
        if (supabaseRes.url) {
          publicUrl = supabaseRes.url;
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload failed, falling back to local path:", storageErr);
      }
    }

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
// Themes Actions (Multi-Theme Registry & Activation)
// ==========================================

export async function getThemesAction() {
  await assertAdmin();
  try {
    const { THEME_REGISTRY, getActiveThemeId, isRegisteredAndExistingTheme, getThemeManifest } = await import("@/lib/themes");
    const activeTheme = await getActiveThemeId();
    const manifest = getThemeManifest();

    // List only registry themes whose folder exists
    const validThemes = THEME_REGISTRY.filter((t) => isRegisteredAndExistingTheme(t.id));

    // Calculate coverage report per theme
    const REQUIRED_ROUTES = [
      "/",
      "/watch/[videoId]",
      "/search",
      "/channel/[username]",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/settings",
      "/upload-video",
    ];

    const themesWithCoverage = validThemes.map((t) => {
      const implemented = manifest[t.id] || [];
      const hasHome = implemented.includes("/");
      const hasWatch = implemented.some((r) => r.includes("/watch"));
      const hasLogin = implemented.includes("/login");
      const hasRegister = implemented.includes("/register");
      const hasForgot = implemented.includes("/forgot-password");
      const hasReset = implemented.includes("/reset-password");

      const missingAuth = !hasLogin || !hasRegister || !hasForgot || !hasReset;

      return {
        key: t.id,
        id: t.id,
        name: t.name,
        version: t.version,
        author: t.author,
        authorUrl: t.authorUrl || "https://codecanyon.net/user/doughouzlight",
        description: t.description,
        preview: t.preview,
        isActive: t.id === activeTheme,
        missingAuth,
        implementedCount: implemented.length,
        requiredCoverage: {
          total: REQUIRED_ROUTES.length,
          implemented: REQUIRED_ROUTES.filter((req) =>
            implemented.some((imp) => imp === req || imp.startsWith(req.split("[")[0]))
          ).length,
        },
      };
    });

    return {
      success: true,
      activeTheme,
      themes: themesWithCoverage,
    };
  } catch (error: any) {
    console.error("getThemesAction error:", error);
    return {
      success: false,
      activeTheme: "youplay",
      themes: [],
    };
  }
}

export async function activateThemeAction(themeId: string) {
  await assertAdmin();
  try {
    const { isRegisteredAndExistingTheme, invalidateActiveThemeCache, FALLBACK_THEME_ID } = await import("@/lib/themes");

    if (!isRegisteredAndExistingTheme(themeId)) {
      return { success: false, message: `Theme '${themeId}' does not exist or is not registered.` };
    }

    // Set siteConfig.active_theme
    const existing = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "active_theme"))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteConfig)
        .set({ value: themeId })
        .where(eq(siteConfig.name, "active_theme"));
    } else {
      await db.insert(siteConfig).values({
        name: "active_theme",
        value: themeId,
      });
    }

    // Clean up deprecated "theme" row if present
    await db.delete(siteConfig).where(eq(siteConfig.name, "theme"));

    // Invalidate in-memory theme cache
    invalidateActiveThemeCache();

    revalidatePath("/", "layout");
    revalidatePath("/admin/manage-themes");

    return { success: true, message: `Theme '${themeId}' activated successfully!` };
  } catch (error: any) {
    console.error("activateThemeAction error:", error);
    return { success: false, message: error.message || "Failed to activate theme" };
  }
}

