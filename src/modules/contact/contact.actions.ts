"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/mailer";

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

    // Send contact notification to admin email via configured SMTP
    await sendEmail({
      to: process.env.MAIL_FROM_ADDRESS || "admin@example.com",
      subject: `PlayTube Contact: ${validated.firstName} ${validated.lastName}`,
      text: `You have received a new contact message:\n\nName: ${validated.firstName} ${validated.lastName}\nEmail: ${validated.email}\n\nMessage:\n${validated.message}`,
    }).catch((err) => {
      console.warn("[CONTACT US] Mail delivery warning:", err);
    });

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
