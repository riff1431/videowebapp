"use server";

import { db } from "@/db";
import { users, verifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";

export async function requestPasswordResetAction(formData: FormData) {
  const genericSuccessResponse = {
    success: true,
    message: "If an account with that email exists, password reset instructions have been sent.",
  };

  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Always return identical generic message whether email exists or not
      return genericSuccessResponse;
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(verifications).values({
      id: "rst_" + crypto.randomBytes(16).toString("hex"),
      identifier: email,
      value: resetToken,
      expiresAt,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // In development only, log the link server-side
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUTH-DEV] Password reset link for ${email}: ${resetUrl}`);
    }

    // Send reset email via Nodemailer using configured SMTP
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hello,</p>
        <p>A request was received to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      `,
    });

    return genericSuccessResponse;
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
