import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { User, Shield, Key, Image as ImageIcon, CheckCircle, Save } from "lucide-react";

export default async function SettingsPage() {
  const [currentUser] = await db.select().from(users).limit(1);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your channel profile, avatar, credentials, and privacy options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Sidebar matching themes/youplay/layout/settings/content.html */}
          <div className="md:col-span-1 space-y-1">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg">
                <User className="w-4 h-4" />
                <span>General Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>Avatar & Cover</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <Key className="w-4 h-4" />
                <span>Password</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                <Shield className="w-4 h-4" />
                <span>Verification</span>
              </button>
            </div>
          </div>

          {/* Settings Form Panel */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Channel Name
                </label>
                <input
                  type="text"
                  defaultValue={currentUser?.name || "Admin Channel"}
                  className="w-full text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue={currentUser?.username || "admin"}
                  className="w-full text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={currentUser?.email || "admin@playtube.local"}
                  className="w-full text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  About Channel
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell viewers about your channel..."
                  className="w-full text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
