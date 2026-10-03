import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, multiSession } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  plugins: [
    username(), // Enable native username plugin so users can sign in with username or email
    multiSession({
      maximumSessions: 3, // PlayTube allows up to 3 accounts
    }),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "https://playtube-delta.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
  advanced: {
    database: {
      generateId: ({ model }) => {
        if (model === "user") return false;
        return crypto.randomUUID();
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as Record<string, any>;
        const emailOrUsername = (body?.email || body?.username || "").trim().toLowerCase();
        if (emailOrUsername) {
          const [user] = await db
            .select({ id: schema.users.id, active: schema.users.active })
            .from(schema.users)
            .where(
              or(
                eq(schema.users.email, emailOrUsername),
                eq(schema.users.username, emailOrUsername)
              )
            )
            .limit(1);

          if (user && user.active === false) {
            throw new APIError("FORBIDDEN", {
              message: "FORBIDDEN: User account is suspended or banned",
            });
          }
        }
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Block session creation if user active flag is false
          const [user] = await db
            .select({ active: schema.users.active })
            .from(schema.users)
            .where(eq(schema.users.id, Number(session.userId)))
            .limit(1);

          if (user && user.active === false) {
            throw new APIError("FORBIDDEN", {
              message: "FORBIDDEN: User account is suspended or banned",
            });
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4, // Allow PlayTube default short passwords like "admin" / "admin123"
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      avatar: {
        type: "string",
        defaultValue: "/upload/photos/d-avatar.jpg",
      },
      cover: {
        type: "string",
        defaultValue: "/upload/photos/d-cover.jpg",
      },
      isAdmin: {
        type: "boolean",
        defaultValue: false,
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
      gender: {
        type: "string",
        defaultValue: "male",
      },
    },
  },
});
