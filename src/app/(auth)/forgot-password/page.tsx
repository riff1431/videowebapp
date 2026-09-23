"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { requestPasswordResetAction } from "@/modules/auth/password.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [demoLink, setDemoLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    setDemoLink("");

    try {
      const formData = new FormData();
      formData.set("email", email);

      const res = await requestPasswordResetAction(formData);
      if (res.success) {
        setSuccessMsg(res.message || "Reset link dispatched.");
        if (res.demoResetUrl) {
          setDemoLink(res.demoResetUrl);
        }
      } else {
        setError(res.error || "Failed to submit request.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-10 px-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-md border border-[var(--border)] p-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-2">
          Reset Password
        </h2>
        <p className="text-xs text-center text-neutral-500 mb-6">
          Enter your registered email address and we will send you a password reset link.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            {demoLink && (
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/40">
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                  Direct reset link (localhost test environment):
                </p>
                <Link
                  href={demoLink}
                  className="font-bold text-[var(--primary)] underline inline-flex items-center gap-1 mt-1"
                >
                  Click to set new password <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Your Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white placeholder-neutral-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Request New Password"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center text-xs text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--primary)] hover:underline font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
