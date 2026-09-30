"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitContactAction } from "@/modules/contact/contact.actions";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status.type) {
      setStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await submitContactAction(formData);

      if (res.success) {
        setStatus({
          type: "success",
          message:
            res.message ||
            "Your message has been sent successfully. We will get back to you shortly!",
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: res.error || "Failed to submit message. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "A network error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="-m-4 md:-m-6 bg-[#f4f5f7] dark:bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)] pb-28">
      {/* PlayTube Cyan Banner Header */}
      <section className="bg-[#04abf2] w-full pt-14 pb-28 sm:pb-32 px-4 flex items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#04abf2] shadow-xs shrink-0">
            <Mail className="w-5 h-5 text-[#04abf2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-normal">
            Contact us
          </h1>
        </div>
      </section>

      {/* Floating Centered Contact Card */}
      <div className="max-w-[620px] w-full mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl sm:rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800/80 p-6 sm:p-8">
          {/* Status Message Alerts */}
          {status.type === "success" && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Message Sent!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {status.message}
                </p>
              </div>
            </div>
          )}

          {status.type === "error" && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to Send</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  {status.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5"
              >
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder=""
                className="w-full h-10 px-3.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-md text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#04abf2] focus:ring-1 focus:ring-[#04abf2]/20 transition-all"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder=""
                className="w-full h-10 px-3.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-md text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#04abf2] focus:ring-1 focus:ring-[#04abf2]/20 transition-all"
              />
            </div>

            {/* E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5"
              >
                E-mail *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder=""
                className="w-full h-10 px-3.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-md text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#04abf2] focus:ring-1 focus:ring-[#04abf2]/20 transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder=""
                className="w-full p-3.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-md text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#04abf2] focus:ring-1 focus:ring-[#04abf2]/20 transition-all resize-y min-h-[130px]"
              />
            </div>

            {/* Card Footer Divider & Right-Aligned Submit Button */}
            <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-5 mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer select-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
