"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Ticket, Loader2 } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { useRegister } from "@/modules/auth/hooks";
import { Button } from "@/app/themes/default/components/ui/button";

export default function RegisterPage() {
  const { t } = useTranslation();
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    gender,
    setGender,
    inviteCode,
    setInviteCode,
    acceptTerms,
    setAcceptTerms,
    error,
    loading,
    regStatus,
    handleSubmit,
  } = useRegister();

  const { designSettings } = useTheme();
  const logoSrc = getPublicImageUrl(designSettings?.logo, "/logo.png") || "/logo.png";
  const lightLogoSrc = getPublicImageUrl(designSettings?.lightLogo, "/logo-light.png") || "/logo-light.png";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-10 px-4">
      <div className="w-full max-w-[440px] bg-[var(--default-panel)] text-[var(--default-text)] rounded-[32px] shadow-xl border border-[var(--border)]/50 p-8 sm:p-10 transition-all">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Logo"
            className="h-9 mb-4 dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightLogoSrc}
            alt="Logo"
            className="h-9 mb-4 hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--default-text)]">
            {t("register", "Create Account")}
          </h1>
          <p className="text-xs text-[var(--default-muted)] mt-1">
            {t("sign_up_desc", "Sign up to start sharing and discovering videos")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-[var(--default-brand-red)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
              {t("username", "Username")}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("enter_username", "Choose a username")}
              className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
              {t("email", "Email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("enter_email", "name@example.com")}
              className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
              {t("password", "Password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("enter_password", "At least 6 characters")}
              className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
              {t("confirm_password", "Confirm Password")}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirm_password", "Re-type your password")}
              className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
              {t("gender", "Gender")}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
            >
              <option value="male">{t("male", "Male")}</option>
              <option value="female">{t("female", "Female")}</option>
            </select>
          </div>

          {(regStatus.inviteOnly || inviteCode) && (
            <div>
              <label className="block text-xs font-semibold text-[var(--default-text)] mb-1">
                {t("invitation_code", "Invitation Code")}
                {regStatus.inviteOnly && <span className="text-[var(--default-brand-red)] ml-1">*</span>}
              </label>
              <input
                type="text"
                required={regStatus.inviteOnly}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder={t("enter_invitation_code", "Enter your invitation code")}
                className="w-full h-11 px-4 text-xs bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--default-brand-red)]/20 transition-all"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-xs text-[var(--default-muted)]">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="rounded accent-[var(--default-brand-red)]"
            />
            <label htmlFor="terms">
              {t("terms_agreement", "By creating your account, you agree to our")}{" "}
              <Link href="/terms/terms" className="text-[var(--default-brand-red)] hover:underline">
                {t("terms_of_use", "Terms of use")}
              </Link>{" "}
              &{" "}
              <Link href="/terms/privacy" className="text-[var(--default-brand-red)] hover:underline">
                {t("privacy_policy", "Privacy policy")}
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("please_wait", "Creating account...")}</span>
              </>
            ) : (
              <span>{t("register", "Sign Up")}</span>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)]/40 text-center text-xs text-[var(--default-muted)]">
          {t("already_have_account", "Already have an account?")}{" "}
          <Link href="/login" className="font-semibold text-[var(--default-brand-red)] hover:underline">
            {t("login", "Login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
