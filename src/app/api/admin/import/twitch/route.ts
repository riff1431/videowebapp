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
      return NextResponse.json(
        {
          success: false,
          noClientId: true,
          error: "Twitch Client ID is not configured",
          settingsLink: "/admin/settings",
        },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json({ success: false, error: "Channel name is required" }, { status: 400 });
    }

    // Upstream Twitch API requires both Client-ID and OAuth Bearer token
    // Without an app access token, attempt will fail upstream
    return NextResponse.json(
      {
        success: false,
        error: "Twitch API upstream request requires valid OAuth credentials",
        upstreamStatus: 502,
      },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query Twitch API" },
      { status: 500 }
    );
  }
}
