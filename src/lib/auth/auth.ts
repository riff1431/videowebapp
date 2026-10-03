import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, multiSession } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, or, inArray } from "drizzle-orm";

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
      // 1. Block sign in for banned/inactive users
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

      // 2. Enforce registration policies (user_registration and invite_links_system)
      if (ctx.path === "/sign-up/email") {
        const configRows = await db
          .select({ name: schema.siteConfig.name, value: schema.siteConfig.value })
          .from(schema.siteConfig)
          .where(inArray(schema.siteConfig.name, ["user_registration", "invite_links_system"]));

        const cfgMap: Record<string, string> = {};
        for (const r of configRows) {
          cfgMap[r.name] = r.value;
        }

        const registrationOn = (cfgMap["user_registration"] ?? "on") === "on";
        const inviteOnlyOn = (cfgMap["invite_links_system"] ?? "off") === "on";

        const body = (ctx.body || {}) as Record<string, any>;
        const inviteCode = (body.inviteCode || body.invite || "").toString().trim();

        // If registration is off and not using invite code, or if invite code is required
        if (!registrationOn || inviteOnlyOn) {
          if (!inviteCode) {
            throw new APIError("FORBIDDEN", {
              message: !registrationOn
                ? "Registration is currently disabled by administrator. An invitation code is required."
                : "Invitation code is required to register an account.",
            });
          }

          // Validate invitation code
          const [invitation] = await db
            .select()
            .from(schema.adminInvitations)
            .where(eq(schema.adminInvitations.code, inviteCode))
            .limit(1);

          if (!invitation) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid invitation code.",
            });
          }

          if (invitation.status !== 0) {
            throw new APIError("BAD_REQUEST", {
              message: "This invitation code has already been used.",
            });
          }
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          try {
            const newUserId = Number(user.id);
            if (!newUserId) return;

            // Mark invitation code as used if one was supplied
            const body = (ctx?.body || {}) as Record<string, any>;
            const inviteCode = (body.inviteCode || body.invite || "").toString().trim();
            if (inviteCode) {
              await db
                .update(schema.adminInvitations)
                .set({ status: 1 })
                .where(eq(schema.adminInvitations.code, inviteCode));
            }

            // Auto-subscribe user to configured accounts (Phase 1.5)
            const [autoSubConfig] = await db
              .select({ value: schema.siteConfig.value })
              .from(schema.siteConfig)
              .where(eq(schema.siteConfig.name, "auto_subscribe"))
              .limit(1);

            const usernamesStr = autoSubConfig?.value?.trim();
            if (usernamesStr) {
              const usernames = usernamesStr
                .split(",")
                .map((u) => u.trim().toLowerCase())
                .filter(Boolean);

              if (usernames.length > 0) {
                const targetUsers = await db
                  .select({ id: schema.users.id, username: schema.users.username })
                  .from(schema.users)
                  .where(inArray(schema.users.username, usernames));

                for (const target of targetUsers) {
                  // Skip self-subscribe
                  if (target.id === newUserId) continue;

                  // Insert subscription if not already subscribed
                  await db
                    .insert(schema.subscriptions)
                    .values({
                      subscriberId: newUserId,
                      channelId: target.id,
                      createdAt: new Date(),
                    })
                    .onConflictDoNothing();
                }
              }
            }
          } catch (hookErr) {
            console.error("[AUTH HOOK] Error in user.create.after:", hookErr);
          }
        },
      },
    },
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
