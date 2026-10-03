"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PlayTubeSwitch } from "./PlayTubeSwitch";
import { RoleFilterDropdown } from "./RoleFilterDropdown";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface CategoryOption {
  key: string;
  name: string;
}

interface GeneralSettingsClientProps {
  initialConfig: Record<string, string>;
  categories: CategoryOption[];
  languages: { key: string; name: string }[];
  appUrl: string;
}

export function GeneralSettingsClient({
  initialConfig,
  categories,
  languages,
  appUrl,
}: GeneralSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
  const [, startTransition] = useTransition();

  // Selected categories for multi-select
  const [selectedCats, setSelectedCats] = useState<string[]>(() => {
    try {
      const val = initialConfig["fav_category"] || "";
      if (val.startsWith("[") && val.endsWith("]")) {
        return JSON.parse(val);
      }
      return val ? val.split(",").map((s) => s.trim()) : [];
    } catch {
      return [];
    }
  });

  const updateSetting = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));

    startTransition(async () => {
      const res = await saveSingleSettingAction(key, val);
      if (res.success) {
        setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
        setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [key]: "idle" }));
        }, 1500);
      } else {
        setSaveStatus((prev) => ({ ...prev, [key]: "error" }));
      }
    });
  };

  const handleToggle = (key: string, currentVal: string, onVal = "on", offVal = "off") => {
    const isCurrentlyOn = currentVal === onVal || currentVal === "1";
    const nextVal = isCurrentlyOn ? offVal : onVal;
    updateSetting(key, nextVal);
  };

  const handleCatToggle = (catKey: string) => {
    const next = selectedCats.includes(catKey)
      ? selectedCats.filter((k) => k !== catKey)
      : [...selectedCats, catKey];
    setSelectedCats(next);
    updateSetting("fav_category", JSON.stringify(next));
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Top Header & Breadcrumbs */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          General Configuration
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-500 dark:text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Settings</span>
          <span className="text-neutral-500 dark:text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">General Configuration</span>
        </nav>
      </div>

      {/* Top Error / Warning Alert Banner (matches Screenshot 1) */}
      <div className="bg-[#4d1f28] border border-[#6b2533] text-[#fca5a5] px-4 py-3 rounded-md text-[13px] flex items-center gap-2">
        <span className="font-bold text-white">Important!</span>
        <span>There are some errors found on your system, please review</span>
        <Link href="/admin/system-status" className="underline text-red-200 hover:text-white font-medium">
          System Status
        </Link>
        <span>.</span>
      </div>

      {/* 2-Column Responsive Grid matching PlayTube Screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Card 1 - General Configuration                               */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              General Configuration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* 1. Switch Account */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Switch Account
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to switch account.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="switch_account"
                  checked={config["switch_account"] === "on"}
                  onChange={() => handleToggle("switch_account", config["switch_account"] || "off")}
                />
              </div>

              {/* 2. Switch Account Counts */}
              <div className="pt-4">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Switch Account Counts
                </label>
                <input
                  type="text"
                  value={config["switch_account_counts"] ?? "3"}
                  onChange={(e) => updateSetting("switch_account_counts", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                  Switch Account Counts
                </span>
              </div>

              {/* 3. Developer Mode */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Developer Mode
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Turn on error reporting so developer can see errors.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="developer_mode"
                  checked={config["developer_mode"] === "on"}
                  onChange={() => handleToggle("developer_mode", config["developer_mode"] || "off")}
                />
              </div>

              {/* 4. Developers (API System) */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Developers (API System)
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Show /developers page to all users for API requests.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="developers_page"
                  checked={config["developers_page"] === "on"}
                  onChange={() => handleToggle("developers_page", config["developers_page"] || "off")}
                />
              </div>

              {/* 5. Maintenance Mode */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Maintenance Mode
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Turn the whole site under Maintenance.
                    <br />
                    You can get the site back by visiting{" "}
                    <a
                      href={`${appUrl}/login?access=admin`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-500 hover:underline"
                    >
                      {appUrl}/login?access=admin
                    </a>
                  </p>
                </div>
                <PlayTubeSwitch
                  name="maintenance_mode"
                  checked={config["maintenance_mode"] === "on"}
                  onChange={() => handleToggle("maintenance_mode", config["maintenance_mode"] || "off")}
                />
              </div>

              {/* 6. SEO Links */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    SEO Links
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Enable SEO links E.g: site.com/this-is-a-video-_ID.html, this will improve your Google Ranking
                  </p>
                </div>
                <PlayTubeSwitch
                  name="seo_link"
                  checked={config["seo_link"] === "on"}
                  onChange={() => handleToggle("seo_link", config["seo_link"] || "off")}
                />
              </div>

              {/* 7. History System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    History System
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Users will be able to view their watched videos.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="history_system"
                  checked={config["history_system"] === "on"}
                  onChange={() => handleToggle("history_system", config["history_system"] || "off")}
                />
              </div>

              {/* 8. Popular Channels */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Popular Channels
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Show popular channels ranked by most subscribers.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="popular_channels"
                  checked={config["popular_channels"] === "on"}
                  onChange={() => handleToggle("popular_channels", config["popular_channels"] || "off")}
                />
              </div>

              {/* 9. Article System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Article System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_article"] || "all"}
                      onChange={(val) => updateSetting("who_can_article", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Create articles in blog section.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="article_system"
                  checked={config["article_system"] === "on"}
                  onChange={() => handleToggle("article_system", config["article_system"] || "off")}
                />
              </div>

              {/* 10. Show Articles In Home Page */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Show Articles In Home Page
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Articles will seen in home page.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="show_articles"
                  checked={config["show_articles"] === "on"}
                  onChange={() => handleToggle("show_articles", config["show_articles"] || "off")}
                />
              </div>

              {/* 11. +18 Pop-up & Block Time */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      +18 Pop-up
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Show +18 Pop-up when user access the site.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="pop_up_18"
                    checked={config["pop_up_18"] === "on"}
                    onChange={() => handleToggle("pop_up_18", config["pop_up_18"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    +18 Block Time
                  </label>
                  <input
                    type="text"
                    value={config["time_18"] ?? "1"}
                    onChange={(e) => updateSetting("time_18", e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Set the amount of hours to block a user which isn't above 18 years old.
                  </span>
                </div>
              </div>

              {/* 12. Language Modal & Default Language */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Language Modal
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Show language modal when user access the site.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="lang_modal"
                    checked={config["lang_modal"] === "on"}
                    onChange={() => handleToggle("lang_modal", config["lang_modal"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Default Language
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mb-1">
                    Choose thhe site default language.
                  </p>
                  <select
                    value={config["language"] ?? "english"}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  >
                    {languages.map((l, i) => (
                      <option key={`${l.key}-${i}`} value={l.key} className="bg-neutral-50 dark:bg-[#181a1d]">
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 13. Report Copyright */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Report Copyright
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to create copyright takedown requests.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="report_copyright"
                  checked={config["report_copyright"] === "on"}
                  onChange={() => handleToggle("report_copyright", config["report_copyright"] || "off")}
                />
              </div>

              {/* 14. Playlist Subscription */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Playlist Subscription
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_playlist"] || "all"}
                      onChange={(val) => updateSetting("who_can_playlist", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to subscribe to playlists
                  </p>
                </div>
                <PlayTubeSwitch
                  name="playlist_subscribe"
                  checked={config["playlist_subscribe"] === "on"}
                  onChange={() => handleToggle("playlist_subscribe", config["playlist_subscribe"] || "off")}
                />
              </div>

              {/* 15. Create Post System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Create Post System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_post"] || "all"}
                      onChange={(val) => updateSetting("who_can_post", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to create post under channel page.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="post_system"
                  checked={config["post_system"] === "on"}
                  onChange={() => handleToggle("post_system", config["post_system"] || "off")}
                />
              </div>

              {/* 16. Favourite category */}
              <div className="pt-4">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Favourite category
                </label>
                <div className="p-2.5 bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] rounded space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCats.includes(cat.key);
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleCatToggle(cat.key)}
                          className={`text-xs px-2.5 py-1 rounded transition-colors ${
                            isSelected
                              ? "bg-[#04abf2] text-white font-medium"
                              : "bg-[#25282e] text-[#8c96a3] hover:text-white hover:bg-[#2e333b]"
                          }`}
                        >
                          {cat.name} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                  {selectedCats.length === 0 && (
                    <span className="text-xs text-[#6c757d]">Select</span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                  Choose which categories you would like to see on your home page.
                </span>
              </div>

              {/* 17. Video Pagination Limit */}
              <div className="pt-4">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Video Pagination Limit
                </label>
                <input
                  type="number"
                  min="2"
                  max="10000"
                  value={config["videos_load_limit"] ?? "20"}
                  onChange={(e) => updateSetting("videos_load_limit", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                  Choose the limit of how many videos will show on each page.
                </span>
              </div>

              {/* 18. Censored Words */}
              <div className="pt-4">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Censored Words
                </label>
                <input
                  type="text"
                  value={config["censored_words"] ?? ""}
                  placeholder=""
                  onChange={(e) => updateSetting("censored_words", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                  Set censored words, seperated by a comma (,)
                </span>
              </div>

              {/* 19. Date Format */}
              <div className="pt-4">
                <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block mb-1">
                  Date Format
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mb-1">
                  Set your site default date format.
                </p>
                <select
                  value={config["date_style"] ?? "m/d/y"}
                  onChange={(e) => updateSetting("date_style", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="m/d/y">mm/dd/yy</option>
                  <option value="d/m/y">dd/mm/yy</option>
                  <option value="y/m/d">yy/mm/dd</option>
                  <option value="M/d/y">mmm/dd/yy</option>
                  <option value="d/F/y">dd/mmmm/yy</option>
                  <option value="Y/m/d">yyyy/mm/dd</option>
                  <option value="d-F-Y">dd mmmm yyyy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 3 Cards (Login, User Config, Other Settings)                */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* CARD 1: Login & Registration */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Login &amp; Registration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* User Registration */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    User Registration
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to create accounts in your site.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="user_registration"
                  checked={config["user_registration"] === "on"}
                  onChange={() => handleToggle("user_registration", config["user_registration"] || "off")}
                />
              </div>

              {/* Account Validation */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Account Validation
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Send an activation link after registration.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="validation"
                  checked={config["validation"] === "on"}
                  onChange={() => handleToggle("validation", config["validation"] || "off")}
                />
              </div>

              {/* Auto Username On Register */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Auto Username On Register
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Generate an auto username on sign up.
                    <br />
                    Registration form will ask for user's first name and last name.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="auto_username"
                  checked={config["auto_username"] === "on"}
                  onChange={() => handleToggle("auto_username", config["auto_username"] || "off")}
                />
              </div>

              {/* Two-Factor Settings */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Two-Factor Settings
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Send confirmation code to email or SMS when user login.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="two_factor_setting"
                  checked={config["two_factor_setting"] === "on"}
                  onChange={() => handleToggle("two_factor_setting", config["two_factor_setting"] || "off")}
                />
              </div>

              {/* Google Authenticator Settings */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Google Authenticator Settings
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Google Authenticator code when user login.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="google_authenticator"
                  checked={config["google_authenticator"] === "on"}
                  onChange={() => handleToggle("google_authenticator", config["google_authenticator"] || "off")}
                />
              </div>

              {/* Authy Settings & Authy Token */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Authy Settings
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Authy code when user login.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="authy_settings"
                    checked={config["authy_settings"] === "on"}
                    onChange={() => handleToggle("authy_settings", config["authy_settings"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Authy Token
                  </label>
                  <input
                    type="text"
                    value={config["authy_token"] ?? ""}
                    onChange={(e) => updateSetting("authy_token", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Authy Token from your twilio account
                  </span>
                </div>
              </div>

              {/* Password Complexity System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Password Complexity System
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    The system will require a powerful password on sign up,
                    <br />
                    including letters, numbers and special characters.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="password_complexity_system"
                  checked={config["password_complexity_system"] === "1"}
                  onChange={() => handleToggle("password_complexity_system", config["password_complexity_system"] || "0", "1", "0")}
                />
              </div>

              {/* Remember This Device */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Remember This Device
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Remember this device in welcome page.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="remember_device"
                  checked={config["remember_device"] === "1"}
                  onChange={() => handleToggle("remember_device", config["remember_device"] || "0", "1", "0")}
                />
              </div>

              {/* Recaptcha & Recaptcha Key */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Recaptcha
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable reCaptcha to prevent spam.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="recaptcha"
                    checked={config["recaptcha"] === "on"}
                    onChange={() => handleToggle("recaptcha", config["recaptcha"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Recaptcha Key
                  </label>
                  <input
                    type="text"
                    value={config["recaptcha_key"] ?? ""}
                    onChange={(e) => updateSetting("recaptcha_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Prevent Bad Login Attempts & Limits */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Prevent Bad Login Attempts
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable this feature to track and stop brute-force attacks.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="prevent_system"
                    checked={config["prevent_system"] === "1"}
                    onChange={() => handleToggle("prevent_system", config["prevent_system"] || "0", "1", "0")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Login Limit
                  </label>
                  <input
                    type="text"
                    value={config["bad_login_limit"] ?? "4"}
                    onChange={(e) => updateSetting("bad_login_limit", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    How many times a user can try to login before a lockout?
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Lockout Time (In Minutes)
                  </label>
                  <input
                    type="text"
                    value={config["lock_time"] ?? "10"}
                    onChange={(e) => updateSetting("lock_time", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    For how long should the user stay locked out?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: User Configuration */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              User Configuration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Delete User Account */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Delete User Account
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to delete their accounts.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="delete_account"
                  checked={config["delete_account"] === "on"}
                  onChange={() => handleToggle("delete_account", config["delete_account"] || "off")}
                />
              </div>

              {/* User Verification Badge */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    User Verification Badge
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Adding verification badge to users
                  </p>
                </div>
                <PlayTubeSwitch
                  name="verification_badge"
                  checked={config["verification_badge"] === "on"}
                  onChange={() => handleToggle("verification_badge", config["verification_badge"] || "off")}
                />
              </div>

              {/* User Block System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    User Block System
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to block each other.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="block_system"
                  checked={config["block_system"] === "on"}
                  onChange={() => handleToggle("block_system", config["block_system"] || "off")}
                />
              </div>

              {/* Paid Subscribers & Commission */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center">
                      <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                        Paid Subscribers
                      </label>
                      <RoleFilterDropdown
                        value={config["who_can_payed_subscribers"] || "admin"}
                        onChange={(val) => updateSetting("who_can_payed_subscribers", val)}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Users should pay to subscribe to a channel.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="payed_subscribers"
                    checked={config["payed_subscribers"] === "on"}
                    onChange={() => handleToggle("payed_subscribers", config["payed_subscribers"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Commission
                  </label>
                  <input
                    type="text"
                    value={config["admin_com_subscribers"] ?? "2"}
                    onChange={(e) => updateSetting("admin_com_subscribers", e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Your percentage cut from paid subscribers (Leave it 0 if you don't want to get any commissions.)
                  </span>
                </div>
              </div>

              {/* Donation System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Donation System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_donate"] || "all"}
                      onChange={(val) => updateSetting("who_can_donate", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to donate to channels.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="donate_system"
                  checked={config["donate_system"] === "on"}
                  onChange={() => handleToggle("donate_system", config["donate_system"] || "off")}
                />
              </div>

              {/* User Invite System & Limit & Period */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center">
                      <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                        User Invite System
                      </label>
                      <RoleFilterDropdown
                        value={config["who_can_invite_links"] || "admin"}
                        onChange={(val) => updateSetting("who_can_invite_links", val)}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Allow users to invite other users to your site.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="invite_links_system"
                    checked={config["invite_links_system"] === "on"}
                    onChange={() => handleToggle("invite_links_system", config["invite_links_system"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    How many links can a user generate?
                  </label>
                  <input
                    type="text"
                    value={config["user_links_limit"] ?? "10"}
                    onChange={(e) => updateSetting("user_links_limit", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    User can generate X links within?
                  </label>
                  <select
                    value={config["expire_user_links"] ?? "month"}
                    onChange={(e) => updateSetting("expire_user_links", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  >
                    <option value="hour">1 Hour</option>
                    <option value="day">1 Day</option>
                    <option value="week">1 Week</option>
                    <option value="month">1 Month</option>
                    <option value="year">1 Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Other Settings */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Other Settings
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Messaging & Notifications Server */}
              <div className="pt-0 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Messaging &amp; Notifications Server
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Choose which server to use, NodeJS or Ajax. See How to run and install Nodejs/forever/npm on your server?
                </p>
                <select
                  value={config["server"] ?? "ajax"}
                  onChange={(e) => updateSetting("server", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="ajax">AJAX</option>
                  <option value="nodejs">WebSockets</option>
                </select>
              </div>

              {/* Comment System */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Comment System
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Choose the comment system default provider.
                </p>
                <select
                  value={config["comment_system"] ?? "default"}
                  onChange={(e) => updateSetting("comment_system", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="default">AJAX (PlayTube)</option>
                  <option value="fb">FaceBook</option>
                  <option value="both">Both</option>
                </select>
              </div>

              {/* Default Showen Comments */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Default Showen Comments
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  How many comments to show by default?
                </p>
                <select
                  value={config["comments_default_num"] ?? "40"}
                  onChange={(e) => updateSetting("comments_default_num", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
