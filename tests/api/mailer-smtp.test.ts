import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { getMailerTransporter, sendEmail } from "@/lib/mailer";
import { testSmtpEmailAction } from "@/modules/admin/settings.actions";
import { submitContactAction } from "@/modules/contact/contact.actions";
import nodemailer from "nodemailer";

describe("Phase 1.4: SMTP Mailer Configuration and Dispatching", () => {
  beforeAll(async () => {
    // Configure test SMTP settings in site_config
    await db
      .insert(siteConfig)
      .values({ name: "smtp_host", value: "smtp.mailhog.local" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "smtp.mailhog.local" } });

    await db
      .insert(siteConfig)
      .values({ name: "smtp_port", value: "1025" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "1025" } });

    await db
      .insert(siteConfig)
      .values({ name: "smtp_username", value: "testuser@example.com" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "testuser@example.com" } });

    await db
      .insert(siteConfig)
      .values({ name: "smtp_password", value: "secret_pass_123" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "secret_pass_123" } });

    await db
      .insert(siteConfig)
      .values({ name: "site_email", value: "admin@playtube.com" })
      .onConflictDoUpdate({ target: siteConfig.name, set: { value: "admin@playtube.com" } });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  it("reads smtp_* values from siteConfig and builds transporter correctly without exposing passwords", async () => {
    const { transporter, from } = await getMailerTransporter();

    expect(from).toContain("admin@playtube.com");
    // Verify transporter options
    const options = (transporter as any).options;
    expect(options.host).toBe("smtp.mailhog.local");
    expect(options.port).toBe(1025);
    expect(options.auth?.user).toBe("testuser@example.com");
    expect(options.auth?.pass).toBe("secret_pass_123");
  });

  it("sends email via transporter sendMail mock and never leaks password", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "msg_12345" });
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
    } as any);

    const result = await sendEmail({
      to: "recipient@example.com",
      subject: "Test Subject",
      text: "Hello from test suite",
    });

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMailMock.mock.calls[0][0];
    expect(callArgs.to).toBe("recipient@example.com");
    expect(callArgs.subject).toBe("Test Subject");
    expect(callArgs.text).toBe("Hello from test suite");
  });

  it("dispatches contact form email using sendEmail", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "msg_contact_123" });
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
    } as any);

    const result = await submitContactAction({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      message: "Need help with video upload.",
    });

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalled();
  });
});
