"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface ManageWebsiteAdsClientProps {
  initialConfig: Record<string, string>;
}

export function ManageWebsiteAdsClient({ initialConfig }: ManageWebsiteAdsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus("saving");
    startTransition(async () => {
      await saveSingleSettingAction("header_ad", config["header_ad"] || "");
      await saveSingleSettingAction("footer_ad", config["footer_ad"] || "");
      await saveSingleSettingAction("watch_side_bar_ad", config["watch_side_bar_ad"] || "");
      await saveSingleSettingAction("watch_comments_ad", config["watch_comments_ad"] || "");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    });
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Website Ads
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Advertisements</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Website Ads</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
          Manage Website Ads
        </h6>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Header Ad */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Header <span className="text-neutral-500 font-normal">(Appears on all pages right under the nav bar)</span>
            </label>
            <textarea
              rows={4}
              value={config["header_ad"] ?? ""}
              onChange={(e) => setConfig({ ...config, header_ad: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Footer Ad */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Footer <span className="text-neutral-500 font-normal">(Appears on all pages right before the footer)</span>
            </label>
            <textarea
              rows={4}
              value={config["footer_ad"] ?? ""}
              onChange={(e) => setConfig({ ...config, footer_ad: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Watch Page Sidebar Ad */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Watch Page Sidebar <span className="text-neutral-500 font-normal">(Appears on watching page above the related videos section)</span>
            </label>
            <textarea
              rows={4}
              value={config["watch_side_bar_ad"] ?? ""}
              onChange={(e) => setConfig({ ...config, watch_side_bar_ad: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Watch Comments Ad */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Watch Comments <span className="text-neutral-500 font-normal">(Appears on watching page above the comments section)</span>
            </label>
            <textarea
              rows={4}
              value={config["watch_comments_ad"] ?? ""}
              onChange={(e) => setConfig({ ...config, watch_comments_ad: e.target.value })}
              className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={saveStatus === "saving"}
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
