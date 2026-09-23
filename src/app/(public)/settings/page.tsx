import React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { User, Shield, Key, Image as ImageIcon, Save } from "lucide-react";

export default async function SettingsPage() {
  const [currentUser] = await db.select().from(users).limit(1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your channel profile, avatar, credentials, and privacy options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Sidebar matching themes/youplay/layout/settings/content.html */}
        <div className="md:col-span-1 space-y-1">
          <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-2 space-y-1 shadow-xs">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[var(--primary)] bg-sky-50 dark:bg-sky-950/40 rounded-lg cursor-pointer">
              <User className="w-4 h-4" />
              <span>General Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              <span>Avatar & Cover</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
              <Key className="w-4 h-4" />
              <span>Password</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
              <Shield className="w-4 h-4" />
              <span>Verification</span>
            </button>
          </div>
        </div>

        {/* Settings Form Panel */}
        <div className="md:col-span-3 bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Channel Name
              </label>
              <input
                type="text"
                defaultValue={currentUser?.name || "Admin Channel"}
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md px-3.5 py-2 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Username
              </label>
              <input
                type="text"
                defaultValue={currentUser?.username || "admin"}
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md px-3.5 py-2 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={currentUser?.email || "admin@playtube.local"}
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md px-3.5 py-2 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                About Channel
              </label>
              <textarea
                rows={4}
                placeholder="Tell viewers about your channel..."
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md p-3 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs px-5 py-2.5 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
