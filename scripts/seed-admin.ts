import { auth } from "../src/lib/auth/auth";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  try {
    const existing = await db.select().from(users).where(eq(users.username, "admin"));
    if (existing.length > 0) {
      await db.delete(users).where(eq(users.username, "admin"));
    }

    const res = await auth.api.signUpEmail({
      body: {
        email: "admin@playtube.local",
        password: "admin",
        name: "admin",
        username: "admin",
      },
    });

    await db
      .update(users)
      .set({
        role: "admin",
        isAdmin: true,
        avatar: "/upload/photos/d-avatar.jpg",
        verified: true,
      })
      .where(eq(users.id, Number(res.user.id)));

    console.log("Admin account successfully created with password 'admin' and verified roles!");
  } catch (err) {
    console.error("Failed to seed admin user:", err);
  }
}
createAdmin();
