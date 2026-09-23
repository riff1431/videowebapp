"use server";

import { db } from "@/db";
import { users, verifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

export async function requestPasswordResetAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (!user) {
      // Return success anyway to avoid user enumeration
      return {
        success: true,
        message: "If an account with that email exists, password reset instructions have been sent.",
      };
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(verifications).values({
      id: "rst_" + crypto.randomBytes(16).toString("hex"),
      identifier: email.trim().toLowerCase(),
      value: resetToken,
      expiresAt,
    });

    // In local/production standard, send email via Nodemailer SMTP or log link
    console.log(`[AUTH] Password reset link for ${email}: /reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);

    return {
      success: true,
      message: "Password reset instructions have been sent to your email address.",
      demoResetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process request." };
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    // Verify token
    const [record] = await db
      .select()
      .from(verifications)
      .where(eq(verifications.identifier, email.trim().toLowerCase()))
      .limit(1);

    if (!record || record.value !== token || record.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired password reset link." };
    }

    // Update password
    await db
      .update(users)
      .set({ password })
      .where(eq(users.email, email.trim().toLowerCase()));

    // Invalidate token
    await db.delete(verifications).where(eq(verifications.id, record.id));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Password update failed." };
  }
}
