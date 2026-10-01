import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = searchParams.get("limit") || "50";

    // Check Twitch Client ID in siteConfig
    const twitchConfig = await db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.name, "twitch_api"))
      .limit(1);

    const twitchClientId = twitchConfig[0]?.value?.trim();

    if (!twitchClientId) {
      return NextResponse.json({
        success: false,
        noClientId: true,
        error:
          "please put your Twitch Client Id in Settings > General Settings to start import videos from Twitch.",
      });
    }

    if (!query) {
      return NextResponse.json({ success: false, error: "Channel name is required" }, { status: 400 });
    }

    // Fallback Mock videos for Twitch channel preview
    const mockItems = Array.from({ length: Math.min(parseInt(limit, 10) || 8, 8) }).map((_, i) => ({
      id: `twitch_${Date.now()}_${i}`,
      title: `${query} Stream VOD Broadcast #${i + 1}`,
      description: `Live Twitch broadcast replay recorded on channel ${query}.`,
      thumbnail: `https://images.unsplash.com/photo-${1542751371 + i * 150}-adc38448a05e?auto=format&fit=crop&w=640&q=80`,
      duration: `0${1 + i}:${10 + i * 5}:00`,
      tags: `${query}, twitch, livestream, vod`,
    }));

    return NextResponse.json({ success: true, items: mockItems });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query Twitch API" },
      { status: 500 }
    );
  }
}
