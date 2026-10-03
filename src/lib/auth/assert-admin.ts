import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isAdmin: boolean;
  active: boolean;
}

/**
 * Asserts that the current request has an active session for a valid, non-banned user.
 * Throws an Error with 401/403 message if unauthenticated or deactivated.
 */
export async function assertUser(customHeaders?: Headers): Promise<AuthenticatedUser> {
  let reqHeaders: Headers;
  try {
    reqHeaders = customHeaders || (await headers());
  } catch {
    reqHeaders = customHeaders || new Headers();
  }
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }

  const userId = Number(session.user.id);
  const [dbUser] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      isAdmin: users.isAdmin,
      active: users.active,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser) {
    throw new Error("UNAUTHORIZED: User account not found");
  }

  if (dbUser.active === false) {
    throw new Error("FORBIDDEN: User account is suspended or banned");
  }

  return {
    id: dbUser.id,
    name: dbUser.name || "",
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role || "user",
    isAdmin: dbUser.isAdmin ?? (dbUser.role === "admin"),
    active: dbUser.active ?? true,
  };
}

/**
 * Asserts that the current request is from an authenticated user with administrator privileges.
 * Throws an Error if not authenticated or not an admin.
 */
export async function assertAdmin(customHeaders?: Headers): Promise<AuthenticatedUser> {
  const user = await assertUser(customHeaders);

  if (!user.isAdmin && user.role !== "admin") {
    throw new Error("FORBIDDEN: Administrator privileges required");
  }

  return user;
}
