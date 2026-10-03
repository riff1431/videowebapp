"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

export async function saveSingleSettingAction(key: string, value: string) {
  await assertAdmin();
  try {
    await db
      .insert(siteConfig)
      .values({ name: key, value })
      .onConflictDoUpdate({
        target: siteConfig.name,
        set: { value },
      });

    try {
      revalidateTag("site-config", "default");
    } catch {}

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving setting:", key, err);
    return { success: false, error: err.message };
  }
}

export async function saveMultipleSettingsAction(settings: Record<string, string>) {
  await assertAdmin();
  try {
    for (const [key, value] of Object.entries(settings)) {
      await db
        .insert(siteConfig)
        .values({ name: key, value })
        .onConflictDoUpdate({
          target: siteConfig.name,
          set: { value },
        });
    }

    try {
      revalidateTag("site-config", "default");
    } catch {}

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error saving settings batch:", err);
    return { success: false, error: err.message };
  }
}

export async function testSmtpEmailAction(targetEmail: string) {
  await assertAdmin();
  try {
    if (!targetEmail || !targetEmail.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const { sendEmail } = await import("@/lib/mailer");
    const result = await sendEmail({
      to: targetEmail.trim(),
      subject: "PlayTube SMTP Configuration Test",
      text: "Hello! This is a test message from your PlayTube installation to confirm your SMTP configuration is functional.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
          <h2 style="color: #2563eb;">PlayTube SMTP Test</h2>
          <p>This email verifies that your site's SMTP settings are working properly.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Sent from Admin Panel &gt; Settings &gt; E-mail Setup</p>
        </div>
      `,
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to dispatch test email." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to dispatch test email." };
  }
}
