import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bannedIps, sessions, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  FALLBACK_THEME_ID,
  getActiveThemeId,
  isRegisteredAndExistingTheme,
  themeHasRoute,
} from "@/lib/themes";

const INTERNAL_THEME_REWRITE_HEADER = "x-internal-theme-rewrite";
const PREVIEW_COOKIE_NAME = "playtube_theme_preview";

interface BannedIpCache {
  ips: Set<string>;
  lastFetched: number;
}

const CACHE_TTL_MS = 60 * 1000;
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
    return ipCache.ips;
  }
}

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
 * Checks if the request comes from an authenticated admin session.
 * Used for admin preview verification (?preview_theme=<id>).
 */
async function isAdminSession(request: NextRequest): Promise<boolean> {
  // Check Better Auth session token cookie (may be signed with .signature suffix)
  const rawCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!rawCookie) return false;
  const token = rawCookie.split(".")[0];

  try {
    const [sess] = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        isAdmin: users.isAdmin,
        role: users.role,
        active: users.active,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(or(eq(sessions.token, rawCookie), eq(sessions.token, token)))
      .limit(1);

    if (!sess) return false;
    if (sess.expiresAt < new Date()) return false;
    if (sess.active === false) return false;

    return sess.isAdmin || sess.role === "admin";
  } catch (e) {
    console.error("[PROXY] Admin session check error:", e);
    return false;
  }
}

/**
 * Next.js 16 Proxy entrypoint (merging Banned IP protection + Multi-Theme Dynamic Routing)
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Strip any client-supplied internal rewrite header to prevent forgery
  const requestHeaders = new Headers(request.headers);
  const clientProvidedInternalHeader = requestHeaders.get(INTERNAL_THEME_REWRITE_HEADER);
  requestHeaders.delete(INTERNAL_THEME_REWRITE_HEADER);

  // 2. Direct external requests to /themes/* must return 404
  if (pathname.startsWith("/themes/") || pathname === "/themes") {
    // Only internal rewrites from this proxy itself are allowed to hit /themes/
    return new NextResponse("Not Found", { status: 404 });
  }

  // 3. Skip: /api, /admin, /_next, static assets, files with extensions, sitemap/robots/manifest
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/upload/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 4. Banned IP enforcement
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

  // 5. Admin Theme Preview (?preview_theme=<id> or preview cookie)
  const previewParam = request.nextUrl.searchParams.get("preview_theme");
  let previewThemeId: string | null = null;
  let shouldSetPreviewCookie = false;
  let shouldClearPreviewCookie = false;

  if (previewParam !== null) {
    if (previewParam === "exit" || previewParam === "") {
      shouldClearPreviewCookie = true;
    } else {
      const isAdmin = await isAdminSession(request);
      if (isAdmin && isRegisteredAndExistingTheme(previewParam)) {
        previewThemeId = previewParam;
        shouldSetPreviewCookie = true;
      }
    }
  } else {
    // Check existing preview cookie
    const cookieVal = request.cookies.get(PREVIEW_COOKIE_NAME)?.value;
    if (cookieVal && isRegisteredAndExistingTheme(cookieVal)) {
      const isAdmin = await isAdminSession(request);
      if (isAdmin) {
        previewThemeId = cookieVal;
      } else {
        shouldClearPreviewCookie = true;
      }
    }
  }

  // 6. Resolve target active theme
  const activeId = previewThemeId || (await getActiveThemeId());

  // 7. Check if active theme implements the route; fallback to FALLBACK_THEME_ID if missing
  let themeToUse = activeId;
  if (!themeHasRoute(themeToUse, pathname)) {
    themeToUse = FALLBACK_THEME_ID;
  }

  // 8. Build destination rewrite path: /themes/<themeToUse><pathname><search>
  const targetPath = `/themes/${themeToUse}${pathname === "/" ? "" : pathname}`;
  const rewriteUrl = new URL(targetPath, request.url);
  rewriteUrl.search = request.nextUrl.search;

  requestHeaders.set(INTERNAL_THEME_REWRITE_HEADER, "1");
  requestHeaders.set("x-playtube-theme", themeToUse);
  if (previewThemeId) {
    requestHeaders.set("x-playtube-preview-theme", previewThemeId);
  }

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  // Handle preview cookies
  if (shouldSetPreviewCookie && previewThemeId) {
    response.cookies.set(PREVIEW_COOKIE_NAME, previewThemeId, {
      path: "/",
      maxAge: 3600, // 1 hour preview
      sameSite: "lax",
    });
  } else if (shouldClearPreviewCookie) {
    response.cookies.delete(PREVIEW_COOKIE_NAME);
  }

  return response;
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|upload/).*)",
  ],
};
