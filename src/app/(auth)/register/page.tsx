"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { AlertCircle, Ticket } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { getRegistrationStatusAction } from "@/modules/auth/registration.actions";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getPublicImageUrl } from "@/lib/storage/image-url";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [inviteCode, setInviteCode] = useState(
    searchParams.get("invite") || searchParams.get("code") || ""
  );
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [regStatus, setRegStatus] = useState<{
    registrationEnabled: boolean;
    inviteOnly: boolean;
    checked: boolean;
  }>({
    registrationEnabled: true,
    inviteOnly: false,
    checked: false,
  });

  useEffect(() => {
    getRegistrationStatusAction().then((status) => {
      setRegStatus({
        ...status,
        checked: true,
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError(t("terms_error", "Please accept the terms of use and privacy policy"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("password_not_match", "Passwords do not match"));
      return;
    }

    if (regStatus.inviteOnly && !inviteCode.trim()) {
      setError(t("invitation_code_required", "An invitation code is required to register"));
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: username.trim(),
        username: username.trim(),
        gender,
        inviteCode: inviteCode.trim(),
      } as any);

      if (res.error) {
        setError(res.error.message || t("invalid_request", "Failed to register account"));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || t("invalid_request", "An unexpected error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const { designSettings } = useTheme();
  const logoSrc = getPublicImageUrl(designSettings?.logo, "/logo.png") || "/logo.png";
  const lightLogoSrc = getPublicImageUrl(designSettings?.lightLogo, "/logo-light.png") || "/logo-light.png";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-10 px-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] rounded-xl shadow-lg border border-[var(--border)] p-8">
        {/* PlayTube Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="PlayTube"
            className="h-9 mb-4 dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightLogoSrc}
            alt="PlayTube"
            className="h-9 mb-4 hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t("register", "Sign Up")}

          </h2>
          {regStatus.inviteOnly && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              <span>{t("invite_only_note", "Registration is currently by invitation only.")}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("username", "Username")}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("username", "Username")}
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("email_address", "E-mail address")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_address", "E-mail address")}
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("password", "Password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password", "Password")}
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("confirm_password", "Confirm Password")}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirm_password", "Confirm password")}
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("gender", "Gender")}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            >
              <option value="male">{t("male", "Male")}</option>
              <option value="female">{t("female", "Female")}</option>
            </select>
          </div>

          {/* Invitation Code input (Required if inviteOnly, optional otherwise) */}
          {(regStatus.inviteOnly || inviteCode) && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t("invitation_code", "Invitation Code")}
                {regStatus.inviteOnly && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                required={regStatus.inviteOnly}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder={t("enter_invitation_code", "Enter your invitation code")}
                className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="rounded accent-[#04abf2]"
            />
            <label htmlFor="terms">
              {t("terms_agreement", "By creating your account, you agree to our")}{" "}
              <Link href="/terms/terms" className="text-[#04abf2] hover:underline">
                {t("terms_of_use", "Terms of use")}
              </Link>{" "}
              &{" "}
              <Link href="/terms/privacy" className="text-[#04abf2] hover:underline">
                {t("privacy_policy", "Privacy policy")}
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-[#04abf2] hover:bg-[#039be5] text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loading ? t("please_wait", "Creating account...") : t("register", "Sign Up")}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-neutral-500 dark:text-neutral-400">
          {t("already_have_account", "Already have an account?")}{" "}
          <Link href="/login" className="font-semibold text-[#04abf2] hover:underline">
            {t("login", "Login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
