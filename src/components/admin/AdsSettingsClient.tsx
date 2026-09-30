"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PlayTubeSwitch } from "./PlayTubeSwitch";
import { RoleFilterDropdown } from "./RoleFilterDropdown";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface AdsSettingsClientProps {
  initialConfig: Record<string, string>;
}

export function AdsSettingsClient({ initialConfig }: AdsSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [, startTransition] = useTransition();

  const updateSetting = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    startTransition(async () => {
      await saveSingleSettingAction(key, val);
    });
  };

  const handleToggle = (key: string, currentVal: string, onVal = "on", offVal = "off") => {
    const isCurrentlyOn = currentVal === onVal || currentVal === "1";
    const nextVal = isCurrentlyOn ? offVal : onVal;
    updateSetting(key, nextVal);
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Advertisement System Settings
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
          <span className="text-neutral-500 dark:text-gray-400">Advertisement System Settings</span>
        </nav>
      </div>

      {/* Info Notice matching Screenshot */}
      <div className="w-full bg-[#d9edf7] dark:bg-[#1a384c] border border-[#bce8f1] dark:border-[#22506d] text-[#31708f] dark:text-[#8ac9eb] px-4 py-3 rounded-md text-xs">
        <strong>Info:</strong> For more information on how advertisement system works, please visit our <a href="#" className="underline font-semibold">documentation</a> page.
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
            Advertisement Settings
          </h6>

          <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
            {/* Advertisement System with Role Filter */}
            <div className="pt-0 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center">
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                    Advertisement System
                  </label>
                  <RoleFilterDropdown
                    value={config["who_can_ads"] || "all"}
                    onChange={(val) => updateSetting("who_can_ads", val)}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                  Allow users to create ads.
                </p>
              </div>
              <PlayTubeSwitch
                name="user_ads"
                checked={config["user_ads"] === "on" || config["user_ads"] === "1"}
                onChange={() => handleToggle("user_ads", config["user_ads"] || "off")}
              />
            </div>

            {/* Cost Per View */}
            <div className="pt-4 space-y-1">
              <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">
                Cost Per View
              </label>
              <input
                type="text"
                value={config["ad_v_price"] ?? "0.1"}
                onChange={(e) => updateSetting("ad_v_price", e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
              />
              <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                Set a price for ad impressions.
              </span>
            </div>

            {/* Cost Per Click */}
            <div className="pt-4 space-y-1">
              <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">
                Cost Per Click
              </label>
              <input
                type="text"
                value={config["ad_c_price"] ?? "0.5"}
                onChange={(e) => updateSetting("ad_c_price", e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
              />
              <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                Set a price for ad clicks.
              </span>
            </div>

            {/* Minimum withdrawal request */}
            <div className="pt-4 space-y-1">
              <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">
                Minimum withdrawal request
              </label>
              <input
                type="text"
                value={config["m_withdrawal"] ?? "50"}
                onChange={(e) => updateSetting("m_withdrawal", e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
              />
              <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                Minimum withdrawal the users can request
              </span>
            </div>

            {/* Video Monetization with Role Filter */}
            <div className="pt-4 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center">
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                    Video Monetization
                  </label>
                  <RoleFilterDropdown
                    value={config["who_can_monetize"] || "all"}
                    onChange={(val) => updateSetting("who_can_monetize", val)}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                  Allow users to monetize their videos.
                </p>
              </div>
              <PlayTubeSwitch
                name="video_monetization"
                checked={config["video_monetization"] === "1" || config["video_monetization"] === "on"}
                onChange={() => handleToggle("video_monetization", config["video_monetization"] || "0", "1", "0")}
              />
            </div>

            {/* Video Monetization Approval System */}
            <div className="pt-4 flex items-start justify-between">
              <div>
                <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                  Video Monetization Approval System
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                  Approve users video monetizations.
                </p>
              </div>
              <PlayTubeSwitch
                name="monetization_approval"
                checked={config["monetization_approval"] === "1" || config["monetization_approval"] === "on"}
                onChange={() => handleToggle("monetization_approval", config["monetization_approval"] || "0", "1", "0")}
              />
            </div>

            {/* Publisher Earning */}
            <div className="pt-4 space-y-1">
              <label className="text-xs text-neutral-700 dark:text-[#ced4da] block font-medium">
                Publisher Earning
              </label>
              <input
                type="text"
                value={config["pub_price"] ?? "0.02"}
                onChange={(e) => updateSetting("pub_price", e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
              />
              <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                How much a video publisher will earn from each ad? Price should not be higher than Cost Per Click
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
