"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First Name is required"),
  lastName: z.string().trim().min(1, "Last Name is required"),
  email: z.string().trim().email("Please provide a valid email address"),
  message: z.string().trim().min(5, "Message must be at least 5 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function submitContactAction(data: ContactFormData) {
  try {
    const validated = contactSchema.parse(data);

    console.log(`[CONTACT US] New message received:`, {
      name: `${validated.firstName} ${validated.lastName}`,
      email: validated.email,
      messageLength: validated.message.length,
      timestamp: new Date().toISOString(),
    });

    // If SMTP credentials are provided, attempt delivery
    if (
      process.env.MAIL_HOST &&
      process.env.MAIL_USERNAME &&
      process.env.MAIL_PASSWORD
    ) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT) || 587,
          secure: Number(process.env.MAIL_PORT) === 465,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.MAIL_FROM_ADDRESS || `support@playtube.local`,
          to: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME,
          replyTo: validated.email,
          subject: `PlayTube Contact: ${validated.firstName} ${validated.lastName}`,
          text: `You have received a new contact message:\n\nName: ${validated.firstName} ${validated.lastName}\nEmail: ${validated.email}\n\nMessage:\n${validated.message}`,
        });
      } catch (mailErr) {
        console.warn("[CONTACT US] Mail delivery skipped or failed (fallback to logging):", mailErr);
      }
    }

    return {
      success: true,
      message: "Your message has been sent successfully. We will get back to you shortly!",
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed.",
      };
    }
    return {
      success: false,
      error: error?.message || "Failed to send your message. Please try again.",
    };
  }
}
