"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { useResetPassword } from "@/modules/auth/hooks";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    handleSubmit,
  } = useResetPassword();

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-md border border-[var(--border)] p-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>

      <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-2">
        {t("change_password", "Change Password")}
      </h2>
      <p className="text-xs text-center text-neutral-500 mb-6">
        {t("reset_password_desc", "Create a new secure password for your account.")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Password changed successfully! Redirecting to login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t("new_password", "New Password")} *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            {t("confirm_password", "Confirm Password")} *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type your password"
            required
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Change Password"}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[var(--border)] text-center text-xs text-neutral-600 dark:text-neutral-400">
        {t("remember_credentials", "Remember your credentials?")}{" "}
        <Link
          href="/login"
          className="text-[var(--primary)] hover:underline font-semibold"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-10 px-4">
      <Suspense fallback={<div className="text-xs text-neutral-500">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
