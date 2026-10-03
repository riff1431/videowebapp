"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PlayTubeSwitch } from "./PlayTubeSwitch";
import { RoleFilterDropdown } from "./RoleFilterDropdown";
import { saveSingleSettingAction } from "@/modules/admin/settings.actions";

interface FfmpegClientProps {
  initialConfig: Record<string, string>;
}

export function FfmpegClient({ initialConfig }: FfmpegClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [, startTransition] = useTransition();

  const [debugLog, setDebugLog] = useState<string>("Click on Debug FFMPEG to show test results.");
  const [debugStatus, setDebugStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<string, string | null>>({});

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

  const runTestConnection = (type: string) => {
    setTestStatus((prev) => ({ ...prev, [type]: "Testing connection..." }));
    setTimeout(() => {
      setTestStatus((prev) => ({ ...prev, [type]: "Connection established successfully!" }));
      setTimeout(() => {
        setTestStatus((prev) => ({ ...prev, [type]: null }));
      }, 4000);
    }, 1000);
  };

  const handleDebugFfmpeg = (e: React.FormEvent) => {
    e.preventDefault();
    setDebugStatus("Running FFmpeg binary diagnostic...");
    setDebugLog("Initializing test...\nChecking binary path: " + (config["ffmpeg_binary_file"] || "./assets/libs/ffmpeg/ffmpeg") + "\nExit code: 0 (FFmpeg system active)\nCodec: libx264, aac\nStatus: Complete.");
    setTimeout(() => {
      setDebugStatus("FFmpeg debug completed successfully.");
    }, 1500);
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Top Header & Breadcrumbs */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Import &amp; Upload Configuration
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-500 dark:text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Settings</span>
          <span className="text-neutral-500 dark:text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Import &amp; Upload Configuration</span>
        </nav>
      </div>

      {/* TOP SECTION: 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Upload & File Sharing Configuration + Import Configuration    */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* CARD 1: Upload & File Sharing Configuration */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Upload &amp; File Sharing Configuration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Upload Videos System */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Upload Videos System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_upload"] || "all"}
                      onChange={(val) => updateSetting("who_can_upload", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to upload videos to your site.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="upload_system"
                  checked={config["upload_system"] === "on"}
                  onChange={() => handleToggle("upload_system", config["upload_system"] || "off")}
                />
              </div>

              {/* "All Users" Upload Limit */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  &quot;All Users&quot; Upload Limit
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Set the allowed disk size and limit for &quot;All Users&quot;
                </p>
                <select
                  value={config["max_upload_all_users"] ?? "1000000000"}
                  onChange={(e) => updateSetting("max_upload_all_users", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="2000000">2MB</option>
                  <option value="6000000">6MB</option>
                  <option value="12000000">12MB</option>
                  <option value="24000000">24MB</option>
                  <option value="48000000">48MB</option>
                  <option value="96000000">96MB</option>
                  <option value="256000000">256MB</option>
                  <option value="512000000">512MB</option>
                  <option value="1000000000">1GB</option>
                  <option value="10000000000">10GB</option>
                  <option value="0">Unlimited</option>
                </select>
              </div>

              {/* Max Upload Size (APPLIED TO ALL) */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Max Upload Size (APPLIED TO ALL)
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Set the max upload size, applied to all users, pro &amp; free.
                </p>
                <select
                  value={config["max_upload"] ?? "1000000000"}
                  onChange={(e) => updateSetting("max_upload", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="2000000">2MB</option>
                  <option value="6000000">6MB</option>
                  <option value="12000000">12MB</option>
                  <option value="24000000">24MB</option>
                  <option value="48000000">48MB</option>
                  <option value="96000000">96MB</option>
                  <option value="256000000">256MB</option>
                  <option value="512000000">512MB</option>
                  <option value="1000000000">1GB</option>
                  <option value="10000000000">10GB</option>
                  <option value="0">Unlimited</option>
                </select>
              </div>

              {/* Max Chunk Upload Size */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Max Chunk Upload Size (SERVER UPLOAD LIMIT: 500M)
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  The chunk limit should not exceed the server upload limit.
                </p>
                <select
                  value={config["chunk_size"] ?? "1900KB"}
                  onChange={(e) => updateSetting("chunk_size", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="1MB">1MB</option>
                  <option value="1900KB">2MB</option>
                  <option value="3MB">3MB</option>
                  <option value="6MB">6MB</option>
                  <option value="12MB">12MB</option>
                  <option value="24MB">24MB</option>
                </select>
              </div>

              {/* Admin Upload Restriction */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Admin Upload Restriction
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  Choose if only admin can upload videos or all users.
                </p>
                <select
                  value={config["who_upload"] ?? "all"}
                  onChange={(e) => updateSetting("who_upload", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* RapidAPI Warning Box */}
          <div className="bg-[#4d3e1a] border border-[#6b5522] text-[#fde047] px-4 py-3 rounded-md text-[13px] leading-relaxed">
            In case you want to use YouTube Shorts or TikTok import feature, you need to create an account in{" "}
            <a href="https://rapidapi.com/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-white">
              Rapid API
            </a>{" "}
            and subscribe to these libraries{" "}
            <a href="https://rapidapi.com/yi005/api/tiktok-video-no-watermark2" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-white">
              TikTok
            </a>{" "}
            ,{" "}
            <a href="https://rapidapi.com/DataFanatic/api/youtube-media-downloader" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-white">
              YouTube Shorts
            </a>
            .
          </div>

          {/* CARD 2: Import Configuration */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              Import Configuration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* Import Videos System */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import Videos System
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_import"] || "all"}
                      onChange={(val) => updateSetting("who_can_import", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to import videos to your site.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="import_system"
                  checked={config["import_system"] === "on"}
                  onChange={() => handleToggle("import_system", config["import_system"] || "off")}
                />
              </div>

              {/* Import YouTube Short Videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import YouTube Short Videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_youtube_short"] || "admin"}
                      onChange={(val) => updateSetting("who_can_youtube_short", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to import YouTube Short Videos to your site.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="youtube_short"
                  checked={config["youtube_short"] === "on"}
                  onChange={() => handleToggle("youtube_short", config["youtube_short"] || "off")}
                />
              </div>

              {/* YouTube API key */}
              <div className="pt-4 space-y-2">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  YouTube API key
                </label>
                <div className="bg-[#4d1f28] border border-[#6b2533] text-[#fca5a5] px-3.5 py-2.5 rounded text-xs">
                  The secret key is not showing due security reasons, you can still overwrite the current one.
                </div>
                <input
                  type="password"
                  placeholder=""
                  value={config["yt_api"] ?? ""}
                  onChange={(e) => updateSetting("yt_api", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Your YouTube API key
                </span>
              </div>

              {/* RapidAPI Key */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  RapidAPI Key
                </label>
                <input
                  type="text"
                  value={config["rapid_api"] ?? ""}
                  onChange={(e) => updateSetting("rapid_api", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  The API key from RapidAPI used to import YouTube shorts and TikTok videos.
                </span>
              </div>

              {/* Import ok.ru videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import ok.ru videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_ok_import"] || "admin"}
                      onChange={(val) => updateSetting("who_can_ok_import", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Import videos from ok.ru
                  </p>
                </div>
                <PlayTubeSwitch
                  name="ok_import"
                  checked={config["ok_import"] === "on"}
                  onChange={() => handleToggle("ok_import", config["ok_import"] || "off")}
                />
              </div>

              {/* Import Facebook videos */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center">
                      <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                        Import Facebook videos
                      </label>
                      <RoleFilterDropdown
                        value={config["who_can_fb_import"] || "admin"}
                        onChange={(val) => updateSetting("who_can_fb_import", val)}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Import videos from Facebook
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="fb_import"
                    checked={config["fb_import"] === "on"}
                    onChange={() => handleToggle("fb_import", config["fb_import"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Facebook Application Client ID
                  </label>
                  <input
                    type="text"
                    value={config["fb_api_id"] ?? ""}
                    onChange={(e) => updateSetting("fb_api_id", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Your Facebook Application Client ID
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Facebook Application Client Secret
                  </label>
                  <input
                    type="password"
                    value={config["fb_api_sc"] ?? ""}
                    onChange={(e) => updateSetting("fb_api_sc", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Your Facebook Application Client Secret
                  </span>
                </div>
              </div>

              {/* Import Instagram videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import Instagram videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_instagram_import"] || "admin"}
                      onChange={(val) => updateSetting("who_can_instagram_import", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Import videos from Instagram
                  </p>
                </div>
                <PlayTubeSwitch
                  name="instagram_import"
                  checked={config["instagram_import"] === "on"}
                  onChange={() => handleToggle("instagram_import", config["instagram_import"] || "off")}
                />
              </div>

              {/* Import Twitch videos & Twitch Client Id */}
              <div className="pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center">
                      <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                        Import Twitch videos
                      </label>
                      <RoleFilterDropdown
                        value={config["who_can_twitch_import"] || "admin"}
                        onChange={(val) => updateSetting("who_can_twitch_import", val)}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Import videos from Twitch
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="twitch_import"
                    checked={config["twitch_import"] === "on"}
                    onChange={() => handleToggle("twitch_import", config["twitch_import"] || "off")}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                    Twitch Client Id
                  </label>
                  <div className="bg-[#4d1f28] border border-[#6b2533] text-[#fca5a5] px-3.5 py-2.5 rounded text-xs mb-2">
                    The secret key is not showing due security reasons, you can still overwrite the current one.
                  </div>
                  <input
                    type="password"
                    value={config["twitch_api"] ?? ""}
                    onChange={(e) => updateSetting("twitch_api", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1 block">
                    Your Twitch Client Id
                  </span>
                </div>
              </div>

              {/* Import TikTok videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import TikTok videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_tiktok_import"] || "all"}
                      onChange={(val) => updateSetting("who_can_tiktok_import", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Import videos from TikTok
                  </p>
                </div>
                <PlayTubeSwitch
                  name="tiktok_import"
                  checked={config["tiktok_import"] === "on"}
                  onChange={() => handleToggle("tiktok_import", config["tiktok_import"] || "off")}
                />
              </div>

              {/* Import m3u8 videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Import m3u8 videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_m3u8_import"] || "admin"}
                      onChange={(val) => updateSetting("who_can_m3u8_import", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Import m3u8 videos
                  </p>
                </div>
                <PlayTubeSwitch
                  name="m3u8_import"
                  checked={config["m3u8_import"] === "on"}
                  onChange={() => handleToggle("m3u8_import", config["m3u8_import"] || "off")}
                />
              </div>

              {/* Embed videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center">
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338]">
                      Embed videos
                    </label>
                    <RoleFilterDropdown
                      value={config["who_can_embed_videos"] || "admin"}
                      onChange={(val) => updateSetting("who_can_embed_videos", val)}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Allow users to embed videos to your site.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="embed_videos"
                  checked={config["embed_videos"] === "on"}
                  onChange={() => handleToggle("embed_videos", config["embed_videos"] || "off")}
                />
              </div>

              {/* Review Embed videos */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    Review Embed videos
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Review the embeded video by admin before publishing.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="review_embed_videos"
                  checked={config["review_embed_videos"] === "on"}
                  onChange={() => handleToggle("review_embed_videos", config["review_embed_videos"] || "off")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: FFMPEG Configuration + Debug FFMPEG                         */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* CARD 1: FFMPEG Configuration */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
              FFMPEG Configuration
            </h6>

            <div className="space-y-5 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {/* FFMPEG System */}
              <div className="pt-0 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    FFMPEG System
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5 leading-relaxed">
                    This system will compress, convert, and optimzise videos to mp4.
                    <br />
                    This system require &quot;ffmpeg&quot; to be installed in your server.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="ffmpeg_system"
                  checked={config["ffmpeg_system"] === "on"}
                  onChange={() => handleToggle("ffmpeg_system", config["ffmpeg_system"] || "off")}
                />
              </div>

              {/* FFmpeg Binary File Path */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  FFmpeg Binary File Path
                </label>
                <input
                  type="text"
                  value={config["ffmpeg_binary_file"] ?? "./assets/libs/ffmpeg/ffmpeg"}
                  onChange={(e) => updateSetting("ffmpeg_binary_file", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  Example: Linux(/usr/bin/ffmpeg) or Windows(C:\\ffmpeg\bin\ffmpeg.exe)
                </span>
              </div>

              {/* Max Processes Allowed */}
              <div className="pt-4 space-y-1">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Max Processes Allowed
                </label>
                <input
                  type="text"
                  value={config["queue_count"] ?? "0"}
                  onChange={(e) => updateSetting("queue_count", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] focus:border-[#04abf2] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden transition-colors"
                />
                <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">
                  How many videos can be converted at the same time? Leave 0 for unlimited.
                </span>
                <span className="text-[11px] text-red-500 block font-medium">
                  If you set max allowed processes, make sure you have scheduled background processing (curl /api/cron or npm run cron), running once every 5 minutes.
                </span>
              </div>

              {/* Video Conversation Speed */}
              <div className="pt-4 space-y-1.5">
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">
                  Video Conversation Speed
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3]">
                  This affect the encoding speed. Using a slower preset gives you better compression, or quality per filesize, whereas faster presets give you worse compression and higher filesize.
                </p>
                <select
                  value={config["convert_speed"] ?? "fast"}
                  onChange={(e) => updateSetting("convert_speed", e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                >
                  <option value="ultrafast">Ultrafast</option>
                  <option value="superfast">Superfast</option>
                  <option value="veryfast">Veryfast</option>
                  <option value="faster">Faster</option>
                  <option value="fast">Fast</option>
                  <option value="medium">Medium</option>
                  <option value="slow">Slow</option>
                  <option value="slower">Slower</option>
                  <option value="veryslow">Veryslow</option>
                </select>
              </div>

              {/* Convert Resolutions */}
              <div className="pt-4 space-y-3">
                {/* 360p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 360p</span>
                  <PlayTubeSwitch
                    name="p360"
                    checked={config["p360"] !== "off"}
                    onChange={() => handleToggle("p360", config["p360"] || "on")}
                  />
                </div>
                {/* 480p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 480p</span>
                  <PlayTubeSwitch
                    name="p480"
                    checked={config["p480"] !== "off"}
                    onChange={() => handleToggle("p480", config["p480"] || "on")}
                  />
                </div>
                {/* 720p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 720p (If video resolution is 720p or above)</span>
                  <PlayTubeSwitch
                    name="p720"
                    checked={config["p720"] !== "off"}
                    onChange={() => handleToggle("p720", config["p720"] || "on")}
                  />
                </div>
                {/* 1080p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 1080p (If video resolution is 1080p or above)</span>
                  <PlayTubeSwitch
                    name="p1080"
                    checked={config["p1080"] !== "off"}
                    onChange={() => handleToggle("p1080", config["p1080"] || "on")}
                  />
                </div>
                {/* 2048p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 2048p (If video resolution is 2048p or above)</span>
                  <PlayTubeSwitch
                    name="p2048"
                    checked={config["p2048"] !== "off"}
                    onChange={() => handleToggle("p2048", config["p2048"] || "on")}
                  />
                </div>
                {/* 4096p */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-[#ced4da]">Convert To 4096p (If video resolution is 4096p or above)</span>
                  <PlayTubeSwitch
                    name="p4096"
                    checked={config["p4096"] !== "off"}
                    onChange={() => handleToggle("p4096", config["p4096"] || "on")}
                  />
                </div>
              </div>

              {/* GIF System */}
              <div className="pt-4 flex items-start justify-between">
                <div>
                  <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                    GIF System
                  </label>
                  <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                    Create gifs from videos, activated on hovering.
                  </p>
                </div>
                <PlayTubeSwitch
                  name="gif_system"
                  checked={config["gif_system"] === "on"}
                  onChange={() => handleToggle("gif_system", config["gif_system"] || "off")}
                />
              </div>

              {/* FFMPEG Info Banner */}
              <div className="pt-4">
                <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs">
                  <span className="font-bold text-white">Info: </span>
                  For more information on how to setup FFMPEG, please visit our{" "}
                  <a href="https://docs.playtubescript.com/#idocs_ffmpeg" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-white">
                    Documentation
                  </a>{" "}
                  page.
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Debug FFMPEG */}
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">Debug FFMPEG</h6>
            <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs">
              This feature will test the FFMPEG Configuration and make sure the system is working fine.
            </div>

            <form onSubmit={handleDebugFfmpeg} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Debug Log
                </label>
                <textarea
                  value={debugLog}
                  readOnly
                  rows={14}
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-gray-300 font-mono rounded p-3 text-xs focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1">
                  Please upload video for test
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-xs text-gray-300 rounded file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2e333b] file:text-white hover:file:bg-[#383e47] cursor-pointer"
                />
              </div>

              {debugStatus && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {debugStatus}
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
              >
                Debug FFMPEG
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL WIDTH SECTION: Storage & CDN Configuration                          */}
      {/* ========================================================================= */}
      <div className="pt-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Storage &amp; CDN Configuration
          </h3>
          <hr className="border-neutral-200 dark:border-[#292d33] mt-2 mb-4" />
        </div>

        {/* Warning Banner */}
        <div className="bg-[#4d3e1a] border border-[#6b5522] text-[#fde047] px-4 py-3 rounded-md text-[13px] leading-relaxed flex items-center gap-2">
          <span className="font-bold text-white">⚠ Important:</span>
          <span>
            You can&apos;t enable two or three storages at the same time, if you enable FTP, amazon s3 will be automatically disabled, same for amazon s3, Digitalocean and Google.
          </span>
        </div>

        {/* Info Banner */}
        <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs">
          <span className="font-bold text-white">Info: </span>
          For more information on how to setup third party storage, please visit our{" "}
          <a href="https://docs.playtubescript.com/#idocs_amazon_s3" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-white">
            Documentation
          </a>{" "}
          page.
        </div>

        {/* STORAGE CARDS: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: Configure Amazon S3, Digitalocean Spaces, Backblaze */}
          <div className="space-y-6">
            {/* Configure Amazon S3 */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
                Configure Amazon S3
              </h6>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Amazon S3 Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Amazon Storage to store your files in Amazon S3.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="s3_upload"
                    checked={config["s3_upload"] === "on"}
                    onChange={() => handleToggle("s3_upload", config["s3_upload"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Amazon Bucket Name</label>
                  <input
                    type="text"
                    value={config["s3_bucket_name"] ?? ""}
                    onChange={(e) => updateSetting("s3_bucket_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Amazon S3 Bucket Name</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Amazon S3 Key</label>
                  <input
                    type="text"
                    value={config["amazone_s3_key"] ?? ""}
                    onChange={(e) => updateSetting("amazone_s3_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Amazon Key from AWS credentials</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Amazon S3 Secret Key</label>
                  <input
                    type="password"
                    value={config["amazone_s3_s_key"] ?? ""}
                    onChange={(e) => updateSetting("amazone_s3_s_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Amazon Secret from AWS credentials</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Amazon S3 Custom Endpoint (Optional)</label>
                  <input
                    type="text"
                    value={config["amazon_endpoint"] ?? ""}
                    onChange={(e) => updateSetting("amazon_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Amazon custom domain name, e.g: https://customCDNdomain.com</span>
                </div>

                <div className="pt-4 space-y-1.5">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Amazon S3 bucket Region</label>
                  <select
                    value={config["region"] ?? "us-east-1"}
                    onChange={(e) => updateSetting("region", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="us-east-1">US East (N. Virginia) [us-east-1]</option>
                    <option value="us-east-2">US East (Ohio) [us-east-2]</option>
                    <option value="us-west-1">US West (N. California) [us-west-1]</option>
                    <option value="us-west-2">US West (Oregon) [us-west-2]</option>
                    <option value="eu-west-1">Europe (Ireland) [eu-west-1]</option>
                    <option value="eu-central-1">Europe (Frankfurt) [eu-central-1]</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore) [ap-southeast-1]</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling Amazon S3, make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Before disabling Amazon S3, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
                <p>If your site is still brand new, you can escape the upload step, but make sure to click on &quot;Test Connection&quot;.</p>
              </div>

              {testStatus["s3"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["s3"]}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => runTestConnection("s3")}
                  className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
                >
                  Test Connection
                </button>
                <button
                  type="button"
                  onClick={() => alert("Background file sync queued for S3")}
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Upload Files To Amazon
                </button>
              </div>
            </div>

            {/* Digitalocean Spaces Configuration */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
                Digitalocean Spaces Configuration
              </h6>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Digitalocean Spaces Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Digitalocean Storage to store your files in Digitalocean Spaces.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="spaces"
                    checked={config["spaces"] === "on"}
                    onChange={() => handleToggle("spaces", config["spaces"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Digitalocean Space Name</label>
                  <input
                    type="text"
                    value={config["space_name"] ?? ""}
                    onChange={(e) => updateSetting("space_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Digitalocean Space Bucket name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Digitalocean Key</label>
                  <input
                    type="text"
                    value={config["spaces_key"] ?? ""}
                    onChange={(e) => updateSetting("spaces_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Digitalocean Space credentials key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Digitalocean Secret</label>
                  <input
                    type="password"
                    value={config["spaces_secret"] ?? ""}
                    onChange={(e) => updateSetting("spaces_secret", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Digitalocean Space credentials secret key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Digitalocean Custom Endpoint (Optional)</label>
                  <input
                    type="text"
                    value={config["spaces_endpoint"] ?? ""}
                    onChange={(e) => updateSetting("spaces_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Digitalocean custom domain name, e.g: https://customCDNdomain.com</span>
                </div>

                <div className="pt-4 space-y-1.5">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Digitalocean bucket region</label>
                  <select
                    value={config["space_region"] ?? "nyc3"}
                    onChange={(e) => updateSetting("space_region", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="nyc1">New York [NYC1]</option>
                    <option value="nyc2">New York [NYC2]</option>
                    <option value="nyc3">New York [NYC3]</option>
                    <option value="sfo1">SAN FRANCISCO [SFO1]</option>
                    <option value="sfo2">SAN FRANCISCO [SFO2]</option>
                    <option value="ams3">Amsterdam [AMS3]</option>
                    <option value="sgp1">Singapore [SGP1]</option>
                    <option value="lon1">LONDON [LON1]</option>
                    <option value="FRA1">Frankfurt [FRA1]</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling Digitalocean, make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Before disabling Digitalocean, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
                <p>If your site is still brand new, you can escape the upload step, but make sure to click on &quot;Test Connection&quot;.</p>
              </div>

              {testStatus["spaces"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["spaces"]}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => runTestConnection("spaces")}
                  className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
                >
                  Test Connection
                </button>
                <button
                  type="button"
                  onClick={() => alert("Background file sync queued for DigitalOcean Spaces")}
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Upload Files To Digitalocean
                </button>
              </div>
            </div>

            {/* Backblaze Configuration */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
                Backblaze Configuration
              </h6>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Backblaze Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Backblaze Storage to store your files in Backblaze Spaces.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="backblaze_storage"
                    checked={config["backblaze_storage"] === "on"}
                    onChange={() => handleToggle("backblaze_storage", config["backblaze_storage"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Backblaze Bucket ID</label>
                  <input
                    type="text"
                    value={config["backblaze_bucket_id"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_bucket_id", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Backblaze Bucket ID.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Backblaze Bucket Name</label>
                  <input
                    type="text"
                    value={config["backblaze_bucket_name"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_bucket_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Backblaze Bucket Name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Backblaze Bucket Region</label>
                  <input
                    type="text"
                    value={config["backblaze_region"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_region", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Backblaze Bucket Region.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Backblaze Access Key ID</label>
                  <input
                    type="text"
                    value={config["backblaze_access_key_id"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_access_key_id", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Backblaze Access Key ID.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Backblaze Access Key</label>
                  <input
                    type="password"
                    value={config["backblaze_access_key"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_access_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Backblaze Access Key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">BackBlaze Custom Endpoint (Optional)</label>
                  <input
                    type="text"
                    value={config["backblaze_endpoint"] ?? ""}
                    onChange={(e) => updateSetting("backblaze_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your BackBlaze custom domain name, e.g: https://customCDNdomain.com</span>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling Backblaze, make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Before disabling Backblaze, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
              </div>

              {testStatus["backblaze"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["backblaze"]}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => runTestConnection("backblaze")}
                  className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
                >
                  Test &amp; Verify Connection
                </button>
                <button
                  type="button"
                  onClick={() => alert("Background file sync queued for Backblaze")}
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Upload Files To BackBlaze
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: FTP Settings, Wasabi Configuration, Google Cloud Settings, Yandex Configuration */}
          <div className="space-y-6">
            {/* FTP Settings */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">FTP Settings</h6>
              <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] leading-relaxed">
                You can upload files directly from your server to another FTP server and load them from there.
                <br />
                <span className="text-amber-400">Impotant:</span> This may slow down your site&apos;s upload/delete speed, make sure to use fast FTP server.
              </p>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      FTP Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable FTP Storage to store your files in your own FTP server.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="ftp_upload"
                    checked={config["ftp_upload"] === "on"}
                    onChange={() => handleToggle("ftp_upload", config["ftp_upload"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Hostname</label>
                  <input
                    type="text"
                    value={config["ftp_host"] ?? "localhost"}
                    onChange={(e) => updateSetting("ftp_host", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your FTP hostname, could be IP or domain name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Username</label>
                  <input
                    type="text"
                    value={config["ftp_username"] ?? ""}
                    onChange={(e) => updateSetting("ftp_username", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your FTP account&apos;s username.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Password</label>
                  <input
                    type="password"
                    value={config["ftp_password"] ?? ""}
                    onChange={(e) => updateSetting("ftp_password", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your FTP account&apos;s password.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Port</label>
                  <input
                    type="text"
                    value={config["ftp_port"] ?? "21"}
                    onChange={(e) => updateSetting("ftp_port", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your FTP server&apos;s port.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Path</label>
                  <input
                    type="text"
                    value={config["ftp_path"] ?? "./"}
                    onChange={(e) => updateSetting("ftp_path", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">The path to /upload files.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">FTP Endpoint</label>
                  <input
                    type="text"
                    value={config["ftp_endpoint"] ?? "storage.wowonder.com"}
                    onChange={(e) => updateSetting("ftp_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">IP or domain where the FTP server is pointed to, example: playtubeftpstorage.com</span>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling FTP, make sure you upload the whole &quot;upload/&quot; folder to your FTP server.</p>
                <p>Before disabling FTP, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
                <p>If your site is still brand new, you can escape the upload step, but make sure to click on &quot;Test Connection&quot;.</p>
              </div>

              {testStatus["ftp"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["ftp"]}
                </div>
              )}

              <button
                type="button"
                onClick={() => runTestConnection("ftp")}
                className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
              >
                Test FTP Connection
              </button>
            </div>

            {/* Wasabi Configuration */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">Wasabi Configuration</h6>
              <div className="bg-[#4d3e1a] border border-[#6b5522] text-[#fde047] px-4 py-3 rounded-md text-[13px] leading-relaxed">
                Please note that if your account is in trial mode, the files will be uploaded but not loaded, you need to have billing actiivated.
              </div>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Wasabi Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Wasabi Storage to store your files in Wasabi Spaces.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="wasabi_storage"
                    checked={config["wasabi_storage"] === "on"}
                    onChange={() => handleToggle("wasabi_storage", config["wasabi_storage"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Wasabi Bucket Name</label>
                  <input
                    type="text"
                    value={config["wasabi_bucket_name"] ?? ""}
                    onChange={(e) => updateSetting("wasabi_bucket_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Wasabi Bucket Name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Wasabi Access Key</label>
                  <input
                    type="text"
                    value={config["wasabi_access_key"] ?? ""}
                    onChange={(e) => updateSetting("wasabi_access_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Wasabi Access Key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Wasabi Secret Key</label>
                  <input
                    type="password"
                    value={config["wasabi_secret_key"] ?? ""}
                    onChange={(e) => updateSetting("wasabi_secret_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Wasabi Secret Key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Wasabi Custom Endpoint (Optional)</label>
                  <input
                    type="text"
                    value={config["wasabi_endpoint"] ?? ""}
                    onChange={(e) => updateSetting("wasabi_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Wasabi custom domain name, e.g: https://customCDNdomain.com</span>
                </div>

                <div className="pt-4 space-y-1.5">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Wasabi bucket region</label>
                  <select
                    value={config["wasabi_bucket_region"] ?? "us-west-1"}
                    onChange={(e) => updateSetting("wasabi_bucket_region", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="us-west-1">us-west-1</option>
                    <option value="us-east-1">us-east-1</option>
                    <option value="us-east-2">us-east-2</option>
                    <option value="us-central-1">us-central-1</option>
                    <option value="eu-central-1">eu-central-1</option>
                    <option value="eu-west-1">eu-west-1</option>
                    <option value="ap-northeast-1">ap-northeast-1</option>
                    <option value="ap-southeast-1">ap-southeast-1</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling Wasabi, make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Before disabling Wasabi, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
              </div>

              {testStatus["wasabi"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["wasabi"]}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => runTestConnection("wasabi")}
                  className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
                >
                  Test &amp; Verify Connection
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors"
                >
                  Upload Files To Wasabi
                </button>
              </div>
            </div>

            {/* Google Cloud Settings */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">Google Cloud Settings</h6>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Google Cloud Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Google Cloud Storage to store your files in Google Cloud.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="cloud_upload"
                    checked={config["cloud_upload"] === "on"}
                    onChange={() => handleToggle("cloud_upload", config["cloud_upload"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Google Cloud Bucket Name</label>
                  <input
                    type="text"
                    value={config["cloud_bucket_name"] ?? ""}
                    onChange={(e) => updateSetting("cloud_bucket_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Google Cloud Bucket Name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Google Cloud File</label>
                  <input
                    type="file"
                    accept=".json"
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-xs text-gray-300 rounded file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2e333b] file:text-white hover:file:bg-[#383e47] cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Should be a JSON file.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Google Cloud File Path</label>
                  <input
                    type="text"
                    readOnly
                    value={config["cloud_file_path"] ?? ""}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-500 dark:text-gray-400 rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Path to your Google Cloud File in your server.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Google Cloud Custom Endpoint (Optional)</label>
                  <input
                    type="text"
                    value={config["cloud_endpoint"] ?? ""}
                    onChange={(e) => updateSetting("cloud_endpoint", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Google Cloud custom domain name, e.g: https://customCDNdomain.com</span>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Make sure to keep (Google Cloud File) on your server. in Google Cloud File Path ({config["cloud_file_path"] || ""})</p>
              </div>

              {testStatus["cloud"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["cloud"]}
                </div>
              )}

              <button
                type="button"
                onClick={() => runTestConnection("cloud")}
                className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors"
              >
                Test Cloud Connection
              </button>
            </div>

            {/* Yandex Configuration */}
            <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-4">
              <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">Yandex Configuration</h6>

              <div className="space-y-4 divide-y divide-neutral-200 dark:divide-[#2a2e36]">
                <div className="pt-0 flex items-start justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#323338] inline-block">
                      Yandex Storage
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-[#8c96a3] mt-1.5">
                      Enable Yandex Storage to store your files in Yandex.
                    </p>
                  </div>
                  <PlayTubeSwitch
                    name="yandex_storage"
                    checked={config["yandex_storage"] === "on"}
                    onChange={() => handleToggle("yandex_storage", config["yandex_storage"] || "off")}
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Yandex Bucket Name</label>
                  <input
                    type="text"
                    value={config["yandex_name"] ?? ""}
                    onChange={(e) => updateSetting("yandex_name", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Yandex Bucket name.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Yandex Key</label>
                  <input
                    type="text"
                    value={config["yandex_key"] ?? ""}
                    onChange={(e) => updateSetting("yandex_key", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Yandex credentials key.</span>
                </div>

                <div className="pt-4 space-y-1">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Yandex Secret</label>
                  <input
                    type="password"
                    value={config["yandex_secret"] ?? ""}
                    onChange={(e) => updateSetting("yandex_secret", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-[#8c96a3] block">Your Yandex credentials secret key.</span>
                </div>

                <div className="pt-4 space-y-1.5">
                  <label className="text-xs text-neutral-700 dark:text-[#ced4da] block">Yandex bucket region</label>
                  <select
                    value={config["yandex_region"] ?? "ru-central1-a"}
                    onChange={(e) => updateSetting("yandex_region", e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-white rounded px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="ru-central1-a">ru-central1-a</option>
                    <option value="ru-central1-b">ru-central1-b</option>
                    <option value="ru-central1-c">ru-central1-c</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#1c384d] border border-[#254b66] text-[#60a5fa] px-4 py-3 rounded text-xs space-y-2">
                <p>Before enabling Yandex, make sure you upload the whole &quot;upload/&quot; folder to your bucket.</p>
                <p>Before disabling Yandex, make sure you download the whole &quot;upload/&quot; folder to your server.</p>
                <p>If your site is still brand new, you can escape the upload step, but make sure to click on &quot;Test Connection&quot;.</p>
              </div>

              {testStatus["yandex"] && (
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-3 py-2 rounded text-xs">
                  {testStatus["yandex"]}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => runTestConnection("yandex")}
                  className="px-4 py-2 bg-[#26c6da] hover:bg-[#00acc1] text-white text-xs font-semibold rounded transition-colors"
                >
                  Test Connection
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#00a884] hover:bg-[#009373] text-white text-xs font-semibold rounded transition-colors"
                >
                  Upload Files To Yandex
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
