"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { useLogin } from "@/modules/auth/hooks";
import { Button } from "@/app/themes/default/components/ui/button";

function LoginForm() {
  const { t } = useTranslation();
  const {
    usernameOrEmail,
    setUsernameOrEmail,
    password,
    setPassword,
    rememberDevice,
    setRememberDevice,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <div className="w-full flex items-center justify-center p-4">
      {/* Default Theme Signature Login Card */}
      <div className="w-full max-w-[420px] bg-[var(--default-panel)] text-[var(--default-text)] rounded-[32px] shadow-xl border border-[var(--border)]/50 p-8 sm:p-10 transition-all">
        <h1 className="text-2xl font-bold text-[var(--default-text)] mb-6 text-left tracking-tight">
          {t("login", "Log In")}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-[var(--default-brand-red)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder={t("username", "Username or email")}
              className="w-full h-11 px-4 text-xs sm:text-sm bg-[var(--default-search-bg)] rounded-full border border-[var(--default-search-border)] text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password", "Password")}
              className="w-full h-11 px-4 text-xs sm:text-sm bg-[var(--default-search-bg)] rounded-full border border-[var(--default-search-border)] text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--default-muted)] hover:text-[var(--default-brand-red)] transition-colors"
            >
              {t("forgot_your_password", "Forgot your password?")}
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("please_wait", "Please wait...")}</span>
              </>
            ) : (
              <span>{t("login", "Log In")}</span>
            )}
          </Button>

          {/* Remember this device pill */}
          <div className="pt-2 flex">
            <button
              type="button"
              onClick={() => setRememberDevice(!rememberDevice)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border)]/40 text-[var(--default-muted)] text-xs font-normal cursor-pointer select-none transition-colors"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--default-brand-red)] flex items-center justify-center shrink-0">
                {rememberDevice && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--default-brand-red)]" />
                )}
              </span>
              <span>{t("remember_device", "Remember this device")}</span>
            </button>
          </div>
        </form>

        <div className="border-t border-[var(--border)]/40 my-6" />

        <div className="text-xs text-[var(--default-muted)] text-center">
          {t("new_here", "New here?")}{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--default-brand-red)] hover:underline ml-1"
          >
            {t("register", "Register")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[var(--default-brand-red)] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
