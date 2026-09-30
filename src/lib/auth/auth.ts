import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

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
