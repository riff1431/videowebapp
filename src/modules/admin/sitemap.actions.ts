"use server";

import { db } from "@/db";
import { siteConfig, videos, articles } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface SitemapInfo {
  sitemapUrl: string;
  lastCreated: string;
}

export interface SitemapGenerateResult {
  success: boolean;
  lastCreated: string;
  sitemapUrl: string;
  totalVideos: number;
  totalArticles: number;
  error?: string;
}

function getAppBaseUrl(): string {
  let appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  // Strip trailing slashes
  appUrl = appUrl.replace(/\/+$/, "");
  return appUrl;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function formatPlayTubeDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function getSitemapInfoAction(): Promise<SitemapInfo> {
  const appUrl = getAppBaseUrl();
  const sitemapUrl = `${appUrl}/sitemap-main.xml`;

  let lastCreated = "12-06-2018";

  try {
    const configRows = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.name, "last_created_sitemap"))
      .limit(1);

    if (configRows.length > 0 && configRows[0].value) {
      lastCreated = configRows[0].value;
    }
  } catch (err) {
    console.error("Error fetching last_created_sitemap config:", err);
  }

  return {
    sitemapUrl,
    lastCreated,
  };
}

export async function generateSitemapAction(): Promise<SitemapGenerateResult> {
  const appUrl = getAppBaseUrl();
  const sitemapUrl = `${appUrl}/sitemap-main.xml`;

  try {
    const publicDir = path.join(process.cwd(), "public");
    const sitemapsDir = path.join(publicDir, "sitemaps");

    if (!fs.existsSync(sitemapsDir)) {
      fs.mkdirSync(sitemapsDir, { recursive: true });
    }

    // 1. Fetch public videos (privacy != 1)
    let videoList: { videoId: string; updatedAt: Date; createdAt: Date }[] = [];
    try {
      videoList = await db
        .select({
          videoId: videos.videoId,
          updatedAt: videos.updatedAt,
          createdAt: videos.createdAt,
        })
        .from(videos)
        .where(ne(videos.privacy, 1));
    } catch (e) {
      console.warn("Could not query videos table for sitemap:", e);
    }

    // 2. Fetch active articles
    let articleList: { id: number; title: string; updatedAt: Date; createdAt: Date }[] = [];
    try {
      articleList = await db
        .select({
          id: articles.id,
          title: articles.title,
          updatedAt: articles.updatedAt,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .where(eq(articles.active, true));
    } catch (e) {
      console.warn("Could not query articles table for sitemap:", e);
    }

    // 3. Generate videos XML (sitemap-1.xml)
    let videoXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static core pages
    const staticPages = [
      "",
      "/explore",
      "/trending",
      "/articles",
      "/popular_channels",
      "/terms",
      "/privacy",
      "/contact-us",
    ];

    for (const page of staticPages) {
      videoXml += `  <url>\n`;
      videoXml += `    <loc>${escapeXml(`${appUrl}${page}`)}</loc>\n`;
      videoXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      videoXml += `    <changefreq>daily</changefreq>\n`;
      videoXml += `    <priority>1.0</priority>\n`;
      videoXml += `  </url>\n`;
    }

    for (const vid of videoList) {
      const loc = `${appUrl}/watch/${vid.videoId}`;
      const lastmod = (vid.updatedAt || vid.createdAt || new Date()).toISOString();
      videoXml += `  <url>\n`;
      videoXml += `    <loc>${escapeXml(loc)}</loc>\n`;
      videoXml += `    <lastmod>${lastmod}</lastmod>\n`;
      videoXml += `    <changefreq>monthly</changefreq>\n`;
      videoXml += `    <priority>0.8</priority>\n`;
      videoXml += `  </url>\n`;
    }
    videoXml += `</urlset>`;

    fs.writeFileSync(path.join(sitemapsDir, "sitemap-1.xml"), videoXml, "utf-8");

    // 4. Generate articles XML (sitemap-a-1.xml)
    let articleXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const art of articleList) {
      const slug = art.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const loc = `${appUrl}/articles/read/${slug || art.id}_${art.id}`;
      const lastmod = (art.updatedAt || art.createdAt || new Date()).toISOString();
      articleXml += `  <url>\n`;
      articleXml += `    <loc>${escapeXml(loc)}</loc>\n`;
      articleXml += `    <lastmod>${lastmod}</lastmod>\n`;
      articleXml += `    <changefreq>monthly</changefreq>\n`;
      articleXml += `    <priority>0.8</priority>\n`;
      articleXml += `  </url>\n`;
    }
    articleXml += `</urlset>`;

    fs.writeFileSync(path.join(sitemapsDir, "sitemap-a-1.xml"), articleXml, "utf-8");

    // 5. Generate root sitemapindex sitemap-main.xml
    const nowIso = new Date().toISOString();
    let mainIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    mainIndexXml += `  <sitemap>\n`;
    mainIndexXml += `    <loc>${escapeXml(`${appUrl}/sitemaps/sitemap-1.xml`)}</loc>\n`;
    mainIndexXml += `    <lastmod>${nowIso}</lastmod>\n`;
    mainIndexXml += `  </sitemap>\n`;
    mainIndexXml += `  <sitemap>\n`;
    mainIndexXml += `    <loc>${escapeXml(`${appUrl}/sitemaps/sitemap-a-1.xml`)}</loc>\n`;
    mainIndexXml += `    <lastmod>${nowIso}</lastmod>\n`;
    mainIndexXml += `  </sitemap>\n`;
    mainIndexXml += `</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, "sitemap-main.xml"), mainIndexXml, "utf-8");

    // Also write standard sitemap.xml to mirror sitemap-main.xml for SEO bots
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), mainIndexXml, "utf-8");

    // 6. Update last_created_sitemap in config table
    const lastCreatedDateFormatted = formatPlayTubeDate(new Date());

    try {
      const existing = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.name, "last_created_sitemap"))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteConfig)
          .set({ value: lastCreatedDateFormatted })
          .where(eq(siteConfig.name, "last_created_sitemap"));
      } else {
        await db.insert(siteConfig).values({
          name: "last_created_sitemap",
          value: lastCreatedDateFormatted,
        });
      }
    } catch (dbErr) {
      console.error("Failed to update last_created_sitemap in config table:", dbErr);
    }

    return {
      success: true,
      lastCreated: lastCreatedDateFormatted,
      sitemapUrl,
      totalVideos: videoList.length,
      totalArticles: articleList.length,
    };
  } catch (err: any) {
    console.error("Error generating sitemap:", err);
    return {
      success: false,
      lastCreated: formatPlayTubeDate(new Date()),
      sitemapUrl,
      totalVideos: 0,
      totalArticles: 0,
      error: err.message || "Failed to generate sitemap",
    };
  }
}
