import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bannedIps } from "@/db/schema";

/**
 * In-memory banned IP cache with a 60-second TTL.
 * Using Node runtime / standard Next.js proxy allows direct, performant
 * queries with pg pool and in-memory cache to eliminate edge DB connection bottlenecks.
 */
interface BannedIpCache {
  ips: Set<string>;
  lastFetched: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let ipCache: BannedIpCache = {
  ips: new Set<string>(),
  lastFetched: 0,
};

async function getBannedIpsSet(): Promise<Set<string>> {
  const now = Date.now();
  if (now - ipCache.lastFetched < CACHE_TTL_MS && ipCache.lastFetched > 0) {
    return ipCache.ips;
  }

  try {
    const rows = await db
      .select({ ipAddress: bannedIps.ipAddress })
      .from(bannedIps);

    const set = new Set<string>();
    for (const row of rows) {
      if (row.ipAddress) {
        set.add(row.ipAddress.trim());
      }
    }

    ipCache = {
      ips: set,
      lastFetched: now,
    };
    return ipCache.ips;
  } catch (err) {
    console.error("[PROXY] Failed to query banned IPs from database:", err);
    // Return stale cache if DB fails
    return ipCache.ips;
  }
}

/**
 * Extracts client IP from incoming request headers
 */
export function getClientIp(req: NextRequest | Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Next.js 16 Proxy entrypoint (replaces middleware.ts)
 */
export async function proxy(request: NextRequest) {
  const clientIp = getClientIp(request);
  const bannedSet = await getBannedIpsSet();

  if (bannedSet.has(clientIp)) {
    return new NextResponse(
      JSON.stringify({
        error: "FORBIDDEN: Your IP address has been banned by the administrator.",
      }),
      {
        status: 403,
        headers: { "content-type": "application/json" },
      }
    );
  }

  return NextResponse.next();
}

// Support Next.js standard middleware export format if invoked by Next.js engine
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - upload/ (user uploads)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|upload/).*)",
  ],
};
