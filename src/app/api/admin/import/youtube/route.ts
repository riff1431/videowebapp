import { assertAdmin } from "@/lib/auth/assert-admin";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  await assertAdmin(request.headers);
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

    const apiKey = ytConfig[0]?.value;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube API key is not configured",
          settingsLink: "/admin/settings",
        },
        { status: 400 }
      );
    }

    // Query Google YouTube Data API v3
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&type=video&key=${apiKey}`;
    if (type === "channel") {
      searchUrl += `&channelId=${encodeURIComponent(query)}`;
    } else {
      searchUrl += `&q=${encodeURIComponent(query)}`;
    }

    const res = await fetch(searchUrl);
    if (!res.ok) {
      let upstreamErr = "YouTube API returned an upstream error";
      try {
        const errJson = await res.json();
        upstreamErr = errJson?.error?.message || upstreamErr;
      } catch { }
      return NextResponse.json(
        { success: false, error: upstreamErr, upstreamStatus: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error.message || "YouTube API error" },
        { status: 502 }
      );
    }

    const videoIds = (data.items || []).map((item: any) => item.id.videoId).filter(Boolean);
    let detailsMap: Record<string, any> = {};

    if (videoIds.length > 0) {
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds.join(",")}&key=${apiKey}`
      );
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        for (const item of detailsData.items || []) {
          detailsMap[item.id] = item;
        }
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
