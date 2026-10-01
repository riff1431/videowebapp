"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getAutoSubscribeSettingAction,
  saveAutoSubscribeSettingAction,
} from "@/modules/admin/tools.actions";
import { Check, Loader2 } from "lucide-react";

export default function AutoSubscribePage() {
  const [usernames, setUsernames] = useState("");
  const [savedText, setSavedText] = useState("Save");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchSetting() {
      setLoading(true);
      const res = await getAutoSubscribeSettingAction();
      if (res.success) {
        setUsernames(res.value || "");
      }
      setLoading(false);
    }
    fetchSetting();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAutoSubscribeSettingAction(usernames);
      if (res.success) {
        setSavedText("Saved!");
        setTimeout(() => {
          setSavedText("Save");
        }, 3000);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auto Friend</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            Admin Panel
          </Link>
          <span>›</span>
          <span>Tools</span>
          <span>›</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Auto Friend</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#22252a] border border-gray-200 dark:border-[#292d33] rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Auto Friend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              When a user creates a new account, choose which users you would like to get auto friended / followed.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username(s), sperated by a comma (,)
              </label>
              <input
                type="text"
                disabled={loading}
                value={usernames}
                onChange={(e) => setUsernames(e.target.value)}
                placeholder="admin, testuser, channel1"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1c1e22] border border-gray-300 dark:border-[#292d33] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00adef]"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              This process might take some time, you can check for your site changes after few minutes.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || loading}
                className="px-6 py-2.5 bg-[#00adef] hover:bg-[#0096d6] text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Please wait..</span>
                  </>
                ) : savedText === "Saved!" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
