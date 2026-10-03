import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    if (!query) {
      return NextResponse.json({ success: false, error: "Keyword is required" }, { status: 400 });
    }

    const apiUrl = `https://api.dailymotion.com/videos/?search=${encodeURIComponent(
      query
    )}&page=${page}&limit=${limit}&fields=thumbnail_1080_url,thumbnail_large_url,thumbnail_medium_url,title,duration,description,tags,id`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Dailymotion API returned error",
          upstreamStatus: res.status,
        },
        { status: 502 }
      );
    }
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        {
          success: false,
          error: data.error.message || "Dailymotion API error",
        },
        { status: 502 }
      );
    }

    const items = (data.list || []).map((item: any) => {
      const mins = Math.floor((item.duration || 0) / 60);
      const secs = (item.duration || 0) % 60;
      const formattedDuration = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      return {
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        thumbnail:
          item.thumbnail_1080_url ||
          item.thumbnail_large_url ||
          item.thumbnail_medium_url ||
          "https://images.unsplash.com/photo-1518791841217?auto=format&fit=crop&w=640&q=80",
        duration: formattedDuration,
        tags: (item.tags || []).join(", "),
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch from Dailymotion" },
      { status: 502 }
    );
  }
}
