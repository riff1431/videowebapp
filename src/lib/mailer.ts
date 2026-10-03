import nodemailer from "nodemailer";
import { getSiteConfig } from "@/lib/config";

export interface MailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Creates a Nodemailer transporter based on siteConfig smtp_* settings,
 * falling back to process.env credentials.
 * Passwords are never logged.
 */
export async function getMailerTransporter() {
  const config = await getSiteConfig([
    "smtp_or_mail",
    "smtp_host",
    "smtp_port",
    "smtp_username",
    "smtp_password",
    "smtp_encryption",
    "site_email",
    "site_name",
  ]);

  const host = config.smtp_host || process.env.MAIL_HOST || "localhost";
  const port = parseInt(config.smtp_port || process.env.MAIL_PORT || "587", 10);
  const encryption = (config.smtp_encryption || "tls").toLowerCase();
  const secure = encryption === "ssl" || port === 465;
  const user = config.smtp_username || process.env.MAIL_USERNAME;
  const pass = config.smtp_password || process.env.MAIL_PASSWORD;
  const fromAddress = config.site_email || process.env.MAIL_FROM_ADDRESS || "noreply@playtube.local";
  const fromName = config.site_name || "PlayTube";

  const auth = user && pass ? { user, pass } : undefined;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  return {
    transporter,
    from: `"${fromName}" <${fromAddress}>`,
  };
}

/**
 * Dispatches an email using the configured SMTP settings.
 * Fails safely without exposing secrets.
 */
export async function sendEmail({ to, subject, html, text }: MailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { transporter, from } = await getMailerTransporter();

    await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, ""),
      html,
    });

    return { success: true };
  } catch (err: any) {
    console.error("[MAILER] Email dispatch failed:", err.message || err);
    return { success: false, error: err.message || "Failed to dispatch email." };
  }
}
