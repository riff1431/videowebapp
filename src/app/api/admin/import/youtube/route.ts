import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "public";
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
    }

    // Retrieve YouTube API key from config
    const ytConfig = await db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.name, "yt_api"))
      .limit(1);

    const apiKey = ytConfig[0]?.value?.trim();

    if (apiKey) {
      // Query Google YouTube Data API v3
      let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&type=video&key=${apiKey}`;
      if (type === "channel") {
        searchUrl += `&channelId=${encodeURIComponent(query)}`;
      } else {
        searchUrl += `&q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.error) {
        return NextResponse.json({ success: false, error: data.error.message || "YouTube API error" });
      }

      const videoIds = (data.items || []).map((item: any) => item.id.videoId).filter(Boolean);
      let detailsMap: Record<string, any> = {};

      if (videoIds.length > 0) {
        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${apiKey}`
        );
        const detailsData = await detailsRes.json();
        for (const item of detailsData.items || []) {
          detailsMap[item.id] = item;
        }
      }

      const items = (data.items || []).map((item: any) => {
        const vid = item.id.videoId;
        const details = detailsMap[vid];
        return {
          id: vid,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
          duration: details?.contentDetails?.duration || "03:45",
          tags: (details?.snippet?.tags || []).join(", "),
        };
      });

      return NextResponse.json({ success: true, items });
    }

    // Fallback Mock data when API key is not yet configured, allowing testing & previewing the UI
    const mockItems = Array.from({ length: Math.min(limit, 8) }).map((_, i) => ({
      id: `yt_mock_${Date.now()}_${i}`,
      title: `${query} - Video Demonstration #${i + 1}`,
      description: `Exploring ${query} with detailed walkthrough and commentary. Comprehensive review for video import preview.`,
      thumbnail: `https://images.unsplash.com/photo-${1518791841217 + i * 100}?auto=format&fit=crop&w=640&q=80`,
      duration: `0${3 + i}:${15 + i * 5}`,
      tags: `${query}, demo, gaming, tutorial`,
    }));

    return NextResponse.json({ success: true, items: mockItems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
