"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PlayTubeSwitch } from "./PlayTubeSwitch";
import { RoleFilterDropdown } from "./RoleFilterDropdown";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface SiteSettingsClientProps {
  initialConfig: Record<string, string>;
}

export function SiteSettingsClient({ initialConfig }: SiteSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [, startTransition] = useTransition();

  const updateSetting = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    startTransition(async () => {
      await saveSingleSettingAction(key, val);
    });
  };

  const handleToggle = (key: string, currentVal: string, onVal = "1", offVal = "0") => {
    const isCurrentlyOn = currentVal === onVal || currentVal === "on";
    const nextVal = isCurrentlyOn ? offVal : onVal;
    updateSetting(key, nextVal);
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Website Information
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Settings</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Website Information</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Card 1 - Website Information                                 */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Website Information
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Site Title */}
              <div className="pt-0 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Site Title</label>
                <input
                  type="text"
                  value={config["title"] ?? "PlayTube - The Ultimate Video Sharing Platform"}
                  onChange={(e) => updateSetting("title", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your website general title, it will appear on Google and on your browser tab.
                </span>
              </div>

              {/* Site Name */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Site Name</label>
                <input
                  type="text"
                  value={config["name"] ?? "PlayTube"}
                  onChange={(e) => updateSetting("name", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your website name, it will appear on website's footer and E-mails.
                </span>
              </div>

              {/* Site Keywords */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Site Keywords</label>
                <input
                  type="text"
                  value={config["keyword"] ?? "video, streaming, playtube, sharing, movies"}
                  onChange={(e) => updateSetting("keyword", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your website's keyword, used mostly for SEO and search engines.
                </span>
              </div>

              {/* Site Description */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Site Description</label>
                <textarea
                  rows={4}
                  value={config["description"] ?? ""}
                  onChange={(e) => updateSetting("description", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your website's description, used mostly for SEO and search engines, Max of 100 characters is recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Card 2 - Features API Keys & Card 3 - Point System Settings */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Card 2: Features API Keys & Information */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Features API Keys &amp; Information
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Google Analytics Code */}
              <div className="pt-0 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Google Analytics Code / Custom HTML Code
                </label>
                <textarea
                  rows={3}
                  value={config["google"] ?? ""}
                  onChange={(e) => updateSetting("google", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              {/* Google vignette code */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Google vignette code
                </label>
                <textarea
                  rows={2}
                  value={config["google_vignette"] ?? ""}
                  onChange={(e) => updateSetting("google_vignette", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
              </div>

              {/* Extreme IP Lookup Key */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Extreme IP Lookup Key
                </label>
                <input
                  type="text"
                  value={config["lookup_key"] ?? ""}
                  onChange={(e) => updateSetting("lookup_key", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Extreme IP Lookup Key to get user continent for geo blocking.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Point System Settings */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Point System Settings
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Point System Toggle with Role Filter */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Point System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_point"] || "all"}
                      onChange={(val) => updateSetting("who_can_point", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Gives the ability for users to earn points from liking, sharing, commenting and posting.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="point_level_system"
                  checked={config["point_level_system"] === "1"}
                  onChange={() => handleToggle("point_level_system", config["point_level_system"] || "0", "1", "0")}
                />
              </div>

              {/* Allow user to withdrawal earned points as currency? */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Allow user to withdrawal earned points as currency?
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to transfer earned points into money and withdrawal.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="point_allow_withdrawal"
                  checked={config["point_allow_withdrawal"] === "1"}
                  onChange={() => handleToggle("point_allow_withdrawal", config["point_allow_withdrawal"] || "0", "1", "0")}
                />
              </div>

              {/* $1.00 = ? Point */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  $1.00 = ? Point
                </label>
                <input
                  type="text"
                  value={config["dollar_to_point_cost"] ?? "100"}
                  onChange={(e) => updateSetting("dollar_to_point_cost", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How much does 1 dollar equal in points?
                </span>
              </div>

              {/* Commenting on Videos */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Commenting on Videos
                </label>
                <input
                  type="text"
                  value={config["comments_point"] ?? "10"}
                  onChange={(e) => updateSetting("comments_point", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by creating comments?
                </span>
              </div>

              {/* Liking Videos */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Liking Videos
                </label>
                <input
                  type="text"
                  value={config["likes_point"] ?? "5"}
                  onChange={(e) => updateSetting("likes_point", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by liking videos?
                </span>
              </div>

              {/* Disliking Videos */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Disliking Videos
                </label>
                <input
                  type="text"
                  value={config["dislikes_point"] ?? "2"}
                  onChange={(e) => updateSetting("dislikes_point", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by disliking videos?
                </span>
              </div>

              {/* Watching Videos */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Watching Videos
                </label>
                <input
                  type="text"
                  value={config["watching_point"] ?? "2"}
                  onChange={(e) => updateSetting("watching_point", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by wondering videos?
                </span>
              </div>

              {/* Uploading Videos */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Uploading Videos
                </label>
                <input
                  type="text"
                  value={config["upload_point"] ?? "20"}
                  onChange={(e) => updateSetting("upload_point", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by uploading videos?
                </span>
              </div>

              {/* Free Users Daily Limit */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Free Users Daily Limit
                </label>
                <input
                  type="text"
                  value={config["free_day_limit"] ?? "1000"}
                  onChange={(e) => updateSetting("free_day_limit", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points can a free user earn in a day?
                </span>
              </div>

              {/* Pro Members Daily Limit */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Pro Members Daily Limit
                </label>
                <input
                  type="text"
                  value={config["pro_day_limit"] ?? "2000"}
                  onChange={(e) => updateSetting("pro_day_limit", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points can a pro user earn in a day?
                </span>
              </div>

              {/* AdMob */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  AdMob
                </label>
                <input
                  type="text"
                  value={config["point_system_admob_cost"] ?? "10"}
                  onChange={(e) => updateSetting("point_system_admob_cost", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many points does a user earn by AdMob?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
