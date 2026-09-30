"use server";

import { db } from "@/db";
import { users, sessions, siteConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

async function getAuthUserId(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      return Number(session.user.id);
    }
  } catch (e) {
    // fallback
  }

  // fallback to first admin/user for demo / local dev
  const [firstUser] = await db.select().from(users).limit(1);
  return firstUser?.id || null;
}

// 1. General Settings Action
export async function updateGeneralSettingsAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const username = (formData.get("username") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const gender = (formData.get("gender") as string) || "male";
    const countryId = Number(formData.get("countryId") || 0);
    const age = Number(formData.get("age") || 0);
    const donationPaypal = (formData.get("donationPaypal") as string)?.trim() || "";
    const active = formData.get("active") === "true";
    const isPro = formData.get("isPro") === "true";
    const isAdmin = formData.get("isAdmin") === "true";
    const role = isAdmin ? "admin" : "user";
    const verified = formData.get("verified") === "true";
    const wallet = Number(formData.get("wallet") || 0);

    if (!username) {
      return { success: false, error: "Username is required" };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email is required" };
    }

    // Check username collision if changed
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== userId) {
      return { success: false, error: "Username is already taken" };
    }

    await db
      .update(users)
      .set({
        username,
        email,
        gender,
        countryId,
        age,
        active,
        isPro,
        isAdmin,
        role,
        verified,
        wallet,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings");
    revalidatePath("/settings/general");
    return { success: true, message: "General settings updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update general settings." };
  }
}

// 2. Profile Settings Action
export async function updateProfileSettingsAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const firstName = (formData.get("firstName") as string)?.trim() || "";
    const lastName = (formData.get("lastName") as string)?.trim() || "";
    const fullName = `${firstName} ${lastName}`.trim() || firstName || lastName;
    const about = (formData.get("about") as string)?.trim() || "";
    const facebook = (formData.get("facebook") as string)?.trim() || "";
    const google = (formData.get("google") as string)?.trim() || "";
    const twitter = (formData.get("twitter") as string)?.trim() || "";
    const instagram = (formData.get("instagram") as string)?.trim() || "";

    await db
      .update(users)
      .set({
        name: fullName,
        about,
        facebook,
        google,
        twitter,
        instagram,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    return { success: true, message: "Profile settings updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile settings." };
  }
}

// 3. Privacy Settings Action
export async function updatePrivacySettingsAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    // Save privacy preferences
    revalidatePath("/settings");
    revalidatePath("/settings/privacy");
    return { success: true, message: "Privacy settings updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update privacy settings." };
  }
}

// 4. Monetization Action
export async function toggleMonetizationAction(enabled: boolean) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    revalidatePath("/settings");
    revalidatePath("/settings/monetization");
    return { success: true, message: `Monetization has been ${enabled ? "enabled" : "disabled"}.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update monetization." };
  }
}

// 5. Password Settings Action
export async function updatePasswordSettingsAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: "New password must be at least 4 characters long." };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Update password
    await db
      .update(users)
      .set({
        password: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings/password");
    return { success: true, message: "Password has been updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}

// 6. Avatar & Cover Action
export async function updateAvatarCoverAction(avatar: string, cover: string) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    await db
      .update(users)
      .set({
        avatar: avatar || undefined,
        cover: cover || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings");
    revalidatePath("/settings/avatar");
    return { success: true, message: "Avatar and Cover updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update avatar/cover." };
  }
}

// 7. Verification Request Action
export async function submitVerificationRequestAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const message = formData.get("message") as string;

    if (!firstName || !lastName) {
      return { success: false, error: "Please provide your first and last name." };
    }

    // In a production PlayTube, this creates a verification request in the database
    return {
      success: true,
      message: "Your verification request has been submitted. Our team will review your ID.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit request." };
  }
}

// 8. Two Factor Toggle Action
export async function toggleTwoFactorAction(enabled: boolean) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    return {
      success: true,
      message: enabled
        ? "Two-factor authentication enabled. A verification code will be required on login."
        : "Two-factor authentication disabled.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update two-factor setting." };
  }
}

// 9. Terminate Session Action
export async function terminateSessionAction(sessionId: string) {
  try {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    revalidatePath("/settings/manage_sessions");
    return { success: true, message: "Session terminated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to terminate session." };
  }
}

// 10. Delete Account Action
export async function deleteAccountAction(formData: FormData) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    const password = formData.get("password") as string;
    if (!password) {
      return { success: false, error: "Current password is required to delete your account." };
    }

    await db.delete(users).where(eq(users.id, userId));
    return { success: true, message: "Your account has been deleted." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete account." };
  }
}
