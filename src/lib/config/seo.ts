import { Metadata } from "next";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSiteConfig } from "@/lib/config";

export interface SeoConfigParams {
  pageKey?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "video.other" | "article" | "profile";
}

/**
 * Resolves SEO metadata by reading site_title, site_desc, site_keywords and page-specific
 * overrides from siteConfig.seo. Replaces tokens {SITE_TITLE}, {SITE_DESC}, {SITE_KEYWORDS}.
 */
export async function getSeoMetadata(params: SeoConfigParams = {}): Promise<Metadata> {
  try {
    const configs = await db
      .select()
      .from(siteConfig)
      .where(inArray(siteConfig.name, ["site_title", "site_desc", "site_keywords", "seo", "site_url"]));

    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.name] = c.value || "";
    }

    const siteTitle = map["site_title"] || "PlayTube";
    const siteDesc = map["site_desc"] || "PlayTube is the premier video sharing platform.";
    const siteKeywords = map["site_keywords"] || "video, sharing, playtube";
    const siteUrl = map["site_url"] || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let pageTitleTemplate = params.fallbackTitle || siteTitle;
    let pageDescTemplate = params.fallbackDescription || siteDesc;
    let pageKeywordsTemplate = params.fallbackKeywords || siteKeywords;

    if (params.pageKey && map["seo"]) {
      try {
        const seoMap = JSON.parse(map["seo"]);
        const pageOverride = seoMap[params.pageKey];
        if (pageOverride) {
          if (pageOverride.title) pageTitleTemplate = pageOverride.title;
          if (pageOverride.meta_description) pageDescTemplate = pageOverride.meta_description;
          if (pageOverride.meta_keywords) pageKeywordsTemplate = pageOverride.meta_keywords;
        }
      } catch (err) {
        console.error("[SEO] Failed to parse seo json:", err);
      }
    }

    // Replace tokens
    const resolvedTitle = pageTitleTemplate
      .replace(/\{SITE_TITLE\}/g, siteTitle)
      .replace(/\{SITE_DESC\}/g, siteDesc)
      .replace(/\{SITE_KEYWORDS\}/g, siteKeywords)
      .replace(/\{LANG_KEY\s+[^}]+\}/g, (match) => {
        // e.g. "{LANG_KEY movies}" -> "Movies"
        const part = match.replace(/\{LANG_KEY\s+/, "").replace(/\}/, "");
        return part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, " ");
      });

    const resolvedDesc = pageDescTemplate
      .replace(/\{SITE_TITLE\}/g, siteTitle)
      .replace(/\{SITE_DESC\}/g, siteDesc)
      .replace(/\{SITE_KEYWORDS\}/g, siteKeywords);

    const resolvedKeywords = pageKeywordsTemplate
      .replace(/\{SITE_TITLE\}/g, siteTitle)
      .replace(/\{SITE_DESC\}/g, siteDesc)
      .replace(/\{SITE_KEYWORDS\}/g, siteKeywords);

    const canonicalUrl = params.url ? `${siteUrl}${params.url}` : siteUrl;

    return {
      title: resolvedTitle,
      description: resolvedDesc,
      keywords: resolvedKeywords.split(",").map((k) => k.trim()),
      openGraph: {
        title: resolvedTitle,
        description: resolvedDesc,
        url: canonicalUrl,
        siteName: siteTitle,
        type: params.type || "website",
        images: params.image ? [{ url: params.image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: resolvedTitle,
        description: resolvedDesc,
        images: params.image ? [params.image] : undefined,
      },
    };
  } catch (err) {
    console.error("[SEO] Error building metadata:", err);
    return {
      title: params.fallbackTitle || "PlayTube",
      description: params.fallbackDescription || "PlayTube",
    };
  }
}
