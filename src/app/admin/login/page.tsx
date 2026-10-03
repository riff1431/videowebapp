"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { sanitizeRedirectPath } from "@/modules/auth/hooks";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeRedirectPath(searchParams?.get("redirect") || "/admin", "/admin");

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError(res.error.message || "Invalid credentials");
      } else {
        router.push(redirectTarget);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#22252a] rounded-xl shadow-xl border border-neutral-200 dark:border-[#292d33] p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#04abf2]/10 text-[#04abf2] flex items-center justify-center mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Admin Control Panel</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Sign in with your administrator account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Username or Email
          </label>
          <input
            type="text"
            required
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="admin@playtube.com"
            className="w-full h-10 px-3 text-xs sm:text-sm bg-neutral-100 dark:bg-[#1c1e22] border border-neutral-200 dark:border-[#292d33] rounded-md focus:outline-none focus:border-[#04abf2] text-neutral-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 px-3 text-xs sm:text-sm bg-neutral-100 dark:bg-[#1c1e22] border border-neutral-200 dark:border-[#292d33] rounded-md focus:outline-none focus:border-[#04abf2] text-neutral-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Log In to Admin</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-[#292d33] text-center text-xs text-neutral-500">
        <Link href="/" className="hover:text-[#04abf2] transition-colors">
          ← Return to Website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[#04abf2] animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
