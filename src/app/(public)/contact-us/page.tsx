"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-[var(--primary)] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Contact Us</h1>
            <p className="text-xs text-neutral-500">Have questions or feedback? Send our team a message</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Message Sent!</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Thank you for reaching out. A PlayTube support specialist will respond to your email shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", subject: "", message: "" });
              }}
              className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full h-9 px-3 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full h-9 px-3 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Inquiry / Feedback"
                className="w-full h-9 px-3 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Message *
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
