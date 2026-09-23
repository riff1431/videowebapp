"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
        setError(res.error.message || "Invalid username/email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] py-10 px-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] text-[var(--foreground)] rounded-xl shadow-lg border border-[var(--border)] p-8">
        {/* PlayTube Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="PlayTube"
            className="h-9 mb-4 dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.png"
            alt="PlayTube"
            className="h-9 mb-4 hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Login
          </h2>
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
              Username or E-mail
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Username or E-mail"
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-10 px-3 text-xs bg-[var(--search-bg)] border border-[var(--search-border)] rounded-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-[#04abf2] hover:bg-[#039be5] text-white font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-neutral-500 dark:text-neutral-400">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#04abf2] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
