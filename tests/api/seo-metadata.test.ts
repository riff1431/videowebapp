import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSeoMetadata } from "@/lib/config/seo";

describe("Phase 1.10: SEO Metadata and OpenGraph Engine", () => {
  beforeAll(async () => {
    // Configure test SEO values
    await db
      .insert(siteConfig)
      .values({ name: "site_title", value: "PlayTube Test Site" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "PlayTube Test Site" } });

    await db
      .insert(siteConfig)
      .values({ name: "site_desc", value: "Test description for PlayTube video portal" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "Test description for PlayTube video portal" } });

    const seoOverrides = {
      movies: {
        title: "Cinema Zone - {SITE_TITLE}",
        meta_description: "Discover curated cinema and films on {SITE_TITLE}",
        meta_keywords: "movies, films, cinema",
      },
      home: {
        title: "{SITE_TITLE} - Explore & Watch",
        meta_description: "{SITE_DESC}",
        meta_keywords: "video, stream, home",
      },
    };

    await db
      .insert(siteConfig)
      .values({ name: "seo", value: JSON.stringify(seoOverrides) })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: JSON.stringify(seoOverrides) } });
  });

  it("resolves homepage SEO with dynamic {SITE_TITLE} replacements", async () => {
    const meta = await getSeoMetadata({ pageKey: "home" });
    expect(meta.title).toBe("PlayTube Test Site - Explore & Watch");
    expect(meta.description).toBe("Test description for PlayTube video portal");
    expect((meta.openGraph as any)?.siteName).toBe("PlayTube Test Site");
  });

  it("resolves movies page specific overrides", async () => {
    const meta = await getSeoMetadata({ pageKey: "movies", url: "/movies" });
    expect(meta.title).toBe("Cinema Zone - PlayTube Test Site");
    expect(meta.description).toBe("Discover curated cinema and films on PlayTube Test Site");
    expect(meta.keywords).toContain("movies");
    expect(meta.keywords).toContain("films");
    expect((meta.openGraph as any)?.url).toContain("/movies");
  });

  it("resolves video fallback metadata with openGraph video tags", async () => {
    const meta = await getSeoMetadata({
      fallbackTitle: "My Amazing Video - {SITE_TITLE}",
      fallbackDescription: "Watch this video on {SITE_TITLE}",
      image: "https://example.com/thumb.jpg",
      url: "/watch/pt_123",
      type: "video.other",
    });

    expect(meta.title).toBe("My Amazing Video - PlayTube Test Site");
    expect(meta.description).toBe("Watch this video on PlayTube Test Site");
    expect((meta.openGraph as any)?.type).toBe("video.other");
    expect((meta.openGraph as any)?.images?.[0]?.url).toBe("https://example.com/thumb.jpg");
  });
});
