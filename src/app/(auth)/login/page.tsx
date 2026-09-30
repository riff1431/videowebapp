"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEmail = usernameOrEmail.includes("@");
      let res;
      if (isEmail) {
        res = await authClient.signIn.email({
          email: usernameOrEmail.trim(),
          password,
        });
      } else {
        res = await authClient.signIn.username({
          username: usernameOrEmail.trim(),
          password,
        });
      }

      if (res?.error) {
        setError(res.error.message || "Invalid username/email or password");
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      {/* PlayTube Standard Login Card */}
      <div className="w-full max-w-[410px] bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-100 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 p-8 sm:p-9">
        <h1 className="text-xl font-bold text-neutral-800 dark:text-white mb-6 text-left">
          Log In
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Username"
              className="w-full h-11 px-4 text-xs sm:text-sm bg-[#ececec] dark:bg-neutral-800/90 rounded-md border-0 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#04abf2] transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 px-4 text-xs sm:text-sm bg-[#ececec] dark:bg-neutral-800/90 rounded-md border-0 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#04abf2] transition-all"
            />
          </div>

          <div className="flex justify-end pt-0.5 pb-2">
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#04abf2] dark:hover:text-[#04abf2] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Remember this device pill */}
          <div className="pt-2 flex">
            <button
              type="button"
              onClick={() => setRememberDevice(!rememberDevice)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e1f3fd] dark:bg-sky-950/60 border border-[#b8e4fb] dark:border-sky-800 text-[#0092d6] dark:text-sky-300 text-xs font-normal cursor-pointer select-none transition-colors"
            >
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#0092d6] flex items-center justify-center shrink-0">
                {rememberDevice && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0092d6]" />
                )}
              </span>
              <span>Remember this device</span>
            </button>
          </div>
        </form>

        <div className="border-t border-neutral-100 dark:border-neutral-800/80 my-5" />

        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-neutral-900 dark:text-white hover:text-[#04abf2] dark:hover:text-[#04abf2] transition-colors ml-1"
          >
            Register
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
          <Loader2 className="w-8 h-8 text-[#04abf2] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
