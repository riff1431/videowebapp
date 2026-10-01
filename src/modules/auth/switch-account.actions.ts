"use server";

import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { makeSignature } from "better-auth/crypto";

export interface SwitchedAccountItem {
  userId: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  sessionToken: string;
  isActive?: boolean;
}

const SWITCHED_ACCOUNTS_COOKIE = "pt_switched_accounts";
const MAX_ACCOUNTS = 3;

/**
 * Signs a raw session token using Better Auth's HMAC secret so that
 * Better Auth can authenticate the session cookie seamlessly.
 */
async function createSignedSessionCookie(rawToken: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET || "playtube-better-auth-secret-development-key-32-chars-long";
  const signature = await makeSignature(rawToken, secret);
  return `${rawToken}.${signature}`;
}

/**
 * Extracts the raw session token from a cookie value (which may be `rawToken.signature` or just `rawToken`).
 */
function extractRawToken(cookieValue: string): string {
  if (!cookieValue) return "";
  const dotIndex = cookieValue.indexOf(".");
  return dotIndex !== -1 ? cookieValue.slice(0, dotIndex) : cookieValue;
}

/**
 * READ-ONLY Action: Returns the current list of saved accounts and current user.
 * Safe to call from Server Components (RSC) without "Cookies can only be modified..." errors.
 */
export async function getSwitchedAccountsAction(): Promise<{
  success: boolean;
  accounts: SwitchedAccountItem[];
  currentUserId: number | null;
  canAddMore: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const reqHeaders = await headers();
    const currentSession = await auth.api.getSession({
      headers: reqHeaders,
    });

    const currentUserId = currentSession?.user?.id
      ? Number(currentSession.user.id)
      : null;

    let storedList: SwitchedAccountItem[] = [];
    const cookieVal = cookieStore.get(SWITCHED_ACCOUNTS_COOKIE)?.value;
    if (cookieVal) {
      try {
        storedList = JSON.parse(decodeURIComponent(cookieVal));
      } catch (e) {
        storedList = [];
      }
    }

    // Filter to only tokens that actually exist and haven't expired in the DB
    if (storedList.length > 0) {
      const tokens = storedList.map((a) => a.sessionToken).filter(Boolean);
      const validSessions = await db
        .select({
          token: sessions.token,
          userId: sessions.userId,
        })
        .from(sessions)
        .where(inArray(sessions.token, tokens));

      const validTokenSet = new Set(validSessions.map((s) => s.token));
      storedList = storedList.filter((a) => validTokenSet.has(a.sessionToken));
    }

    // If current user is logged in but not yet in storedList, include them dynamically for display
    if (currentUserId && currentSession?.user) {
      const exists = storedList.some((a) => a.userId === currentUserId);
      if (!exists) {
        const userAvatar =
          (currentSession.user as any).avatar ||
          currentSession.user.image ||
          "/upload/photos/d-avatar.jpg";
        storedList.unshift({
          userId: currentUserId,
          name: currentSession.user.name || (currentSession.user as any).username || "User",
          username: (currentSession.user as any).username || currentSession.user.name || "user",
          email: currentSession.user.email || "",
          avatar: userAvatar,
          sessionToken: "",
          isActive: true,
        });
      }
    }

    const accountsWithActive = storedList.map((acc) => ({
      ...acc,
      isActive: acc.userId === currentUserId,
    }));

    return {
      success: true,
      accounts: accountsWithActive,
      currentUserId,
      canAddMore: accountsWithActive.length < MAX_ACCOUNTS,
    };
  } catch (error: any) {
    console.error("Error in getSwitchedAccountsAction:", error);
    return {
      success: false,
      accounts: [],
      currentUserId: null,
      canAddMore: true,
    };
  }
}

/**
 * MUTATION Action: Adds / updates the current active session in the switched accounts cookie.
 * Must be called in a Server Action context (e.g., when adding an account or after logging in).
 */
export async function syncCurrentAccountAction(): Promise<{
  success: boolean;
  count?: number;
}> {
  try {
    const cookieStore = await cookies();
    const reqHeaders = await headers();
    const currentSession = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!currentSession?.user?.id) {
      return { success: false };
    }

    const currentUserId = Number(currentSession.user.id);
    const primaryCookie = cookieStore.get("better-auth.session_token")?.value;
    const secureCookie = cookieStore.get("__Secure-better-auth.session_token")?.value;
    const rawToken = extractRawToken(primaryCookie || secureCookie || "");

    let storedList: SwitchedAccountItem[] = [];
    const cookieVal = cookieStore.get(SWITCHED_ACCOUNTS_COOKIE)?.value;
    if (cookieVal) {
      try {
        storedList = JSON.parse(decodeURIComponent(cookieVal));
      } catch (e) {
        storedList = [];
      }
    }

    // Verify token exists in database
    let validToken = rawToken;
    if (!validToken) {
      const [latestSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, currentUserId))
        .orderBy(sessions.createdAt)
        .limit(1);
      if (latestSession) {
        validToken = latestSession.token;
      }
    }

    if (validToken) {
      const userAvatar =
        (currentSession.user as any).avatar ||
        currentSession.user.image ||
        "/upload/photos/d-avatar.jpg";

      const item: SwitchedAccountItem = {
        userId: currentUserId,
        name: currentSession.user.name || (currentSession.user as any).username || "User",
        username: (currentSession.user as any).username || currentSession.user.name || "user",
        email: currentSession.user.email || "",
        avatar: userAvatar,
        sessionToken: validToken,
      };

      const existingIdx = storedList.findIndex((a) => a.userId === currentUserId);
      if (existingIdx >= 0) {
        storedList[existingIdx] = item;
      } else {
        storedList.push(item);
      }
    }

    // Validate tokens in database
    if (storedList.length > 0) {
      const tokens = storedList.map((a) => a.sessionToken).filter(Boolean);
      const validSessions = await db
        .select({
          token: sessions.token,
          userId: sessions.userId,
        })
        .from(sessions)
        .where(inArray(sessions.token, tokens));

      const validTokenSet = new Set(validSessions.map((s) => s.token));
      storedList = storedList.filter((a) => validTokenSet.has(a.sessionToken));
    }

    // Limit to max accounts
    storedList = storedList.slice(0, MAX_ACCOUNTS);

    // Save cleaned list back to cookie
    cookieStore.set(
      SWITCHED_ACCOUNTS_COOKIE,
      encodeURIComponent(JSON.stringify(storedList)),
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "lax",
      }
    );

    return { success: true, count: storedList.length };
  } catch (err: any) {
    console.error("Error in syncCurrentAccountAction:", err);
    return { success: false };
  }
}

/**
 * Switches the active session to one of the accounts in the switched list.
 */
export async function switchAccountAction(targetUserId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(SWITCHED_ACCOUNTS_COOKIE)?.value;
    if (!cookieVal) {
      return { success: false, error: "No accounts found to switch" };
    }

    const storedList: SwitchedAccountItem[] = JSON.parse(
      decodeURIComponent(cookieVal)
    );
    const targetAccount = storedList.find((a) => a.userId === targetUserId);

    if (!targetAccount) {
      return { success: false, error: "Account not found in switch list" };
    }

    // Verify token in DB
    const [dbSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, targetAccount.sessionToken))
      .limit(1);

    if (!dbSession) {
      return {
        success: false,
        error: "Session for this account has expired. Please log in again.",
      };
    }

    // Generate signed session cookie for Better Auth
    const signedCookieValue = await createSignedSessionCookie(targetAccount.sessionToken);

    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax" as const,
    };

    cookieStore.set("better-auth.session_token", signedCookieValue, cookieOptions);
    if (process.env.NODE_ENV === "production") {
      cookieStore.set(
        "__Secure-better-auth.session_token",
        signedCookieValue,
        { ...cookieOptions, secure: true }
      );
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in switchAccountAction:", error);
    return { success: false, error: error?.message || "Failed to switch account" };
  }
}

/**
 * Removes an inactive account from the switched accounts list.
 */
export async function removeSwitchedAccountAction(userId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(SWITCHED_ACCOUNTS_COOKIE)?.value;
    if (!cookieVal) {
      return { success: true };
    }

    let storedList: SwitchedAccountItem[] = JSON.parse(
      decodeURIComponent(cookieVal)
    );
    storedList = storedList.filter((a) => a.userId !== userId);

    cookieStore.set(
      SWITCHED_ACCOUNTS_COOKIE,
      encodeURIComponent(JSON.stringify(storedList)),
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error in removeSwitchedAccountAction:", error);
    return { success: false, error: error?.message || "Failed to remove account" };
  }
}

/**
 * Called when initiating "+ Add Account" before redirecting to /login.
 * Ensures the currently active user is preserved in pt_switched_accounts cookie.
 */
export async function prepareAddAccountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await syncCurrentAccountAction();
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
