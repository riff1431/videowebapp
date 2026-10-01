"use server";

import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

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

// Helper to determine the session cookie name used by Better Auth
function getSessionCookieName(): string {
  // Better Auth uses "better-auth.session_token" or "__Secure-better-auth.session_token" in HTTPS
  return process.env.NODE_ENV === "production"
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";
}

/**
 * Reads and validates the list of switched accounts stored in the cookie.
 * Also synchronizes the currently logged-in account into the list.
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

    // Get current session token from cookie
    const primaryCookieName = "better-auth.session_token";
    const secureCookieName = "__Secure-better-auth.session_token";
    const currentToken =
      cookieStore.get(primaryCookieName)?.value ||
      cookieStore.get(secureCookieName)?.value ||
      "";

    let storedList: SwitchedAccountItem[] = [];
    const cookieVal = cookieStore.get(SWITCHED_ACCOUNTS_COOKIE)?.value;
    if (cookieVal) {
      try {
        storedList = JSON.parse(decodeURIComponent(cookieVal));
      } catch (e) {
        storedList = [];
      }
    }

    // If currently logged in, ensure current user is in the list
    if (currentUserId && currentSession?.user && currentToken) {
      const existingIdx = storedList.findIndex((a) => a.userId === currentUserId);
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
        sessionToken: currentToken,
      };

      if (existingIdx >= 0) {
        storedList[existingIdx] = item;
      } else {
        storedList.push(item);
      }
    }

    // Validate that stored session tokens still exist in DB
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

    const accountsWithActive = storedList.map((acc) => ({
      ...acc,
      isActive: acc.userId === currentUserId,
    }));

    return {
      success: true,
      accounts: accountsWithActive,
      currentUserId,
      canAddMore: storedList.length < MAX_ACCOUNTS,
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

    // Update Better Auth session cookies
    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax" as const,
    };

    cookieStore.set("better-auth.session_token", targetAccount.sessionToken, cookieOptions);
    if (process.env.NODE_ENV === "production") {
      cookieStore.set(
        "__Secure-better-auth.session_token",
        targetAccount.sessionToken,
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
    const result = await getSwitchedAccountsAction();
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
