"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateAffiliatesSettingsAction } from "@/modules/admin/users.actions";

interface AffiliatesSettingsClientProps {
  initialConfig: Record<string, string>;
}

export function AffiliatesSettingsClient({ initialConfig }: AffiliatesSettingsClientProps) {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleToggle = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: prev[key] === "1" ? "0" : "1",
    }));
  };

  const handleChange = (key: string, val: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    const formData = new FormData();
    Object.entries(config).forEach(([k, v]) => formData.append(k, v));

    const res = await updateAffiliatesSettingsAction(formData);
    setSaving(false);
    if (res.success) {
      setMsg("Settings saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } else {
      alert(res.error || "Failed to save settings");
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot 1 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Affiliates Settings
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Users</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Affiliates System</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Affiliates Settings</span>
        </nav>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded">
          {msg}
        </div>
      )}

      {/* Main Settings Card matching Screenshots 1 & 2 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-6">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
          Affiliates Settings
        </h6>

        {/* 1. Affiliates System Switch */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-[#292d33]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-900 dark:text-[#ced4da] px-2.5 py-1 bg-neutral-100 dark:bg-[#181a1d] rounded">
                Affiliates System
              </span>
              <span className="w-5 h-5 flex items-center justify-center text-[10px] text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded">
                ⇄
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              User will earn money from invite users to your site
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle("affiliate_system")}
            className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
              config.affiliate_system === "1" ? "bg-[#04abf2]" : "bg-[#c94a4a]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold transition-transform shadow-sm ${
                config.affiliate_system === "1"
                  ? "translate-x-7 text-[#04abf2]"
                  : "translate-x-0 text-[#c94a4a]"
              }`}
            >
              {config.affiliate_system === "1" ? "✓" : "✕"}
            </div>
          </button>
        </div>

        {/* 2. New user is registered */}
        <div className="space-y-3 pt-2 border-b border-neutral-100 dark:border-[#292d33] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-[#ced4da] px-2.5 py-1 bg-neutral-100 dark:bg-[#181a1d] rounded">
                  New user is registred
                </span>
                <span className="w-5 h-5 flex items-center justify-center text-[10px] text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded">
                  ⇄
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                User will earn money when new user is registred
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("affiliate_new_user")}
              className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                config.affiliate_new_user === "1" ? "bg-[#10b981]" : "bg-[#c94a4a]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold transition-transform shadow-sm ${
                  config.affiliate_new_user === "1"
                    ? "translate-x-7 text-[#10b981]"
                    : "translate-x-0 text-[#c94a4a]"
                }`}
              >
                {config.affiliate_new_user === "1" ? "✓" : "✕"}
              </div>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Amount
            </label>
            <input
              type="text"
              value={config.affiliate_reg_amount || "0.10"}
              onChange={(e) => handleChange("affiliate_reg_amount", e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
              The price you'll pay for each new referred user. Default 0.10
            </span>
          </div>
        </div>

        {/* 3. New user is registered & bought a pro package */}
        <div className="space-y-3 pt-2 border-b border-neutral-100 dark:border-[#292d33] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-[#ced4da] px-2.5 py-1 bg-neutral-100 dark:bg-[#181a1d] rounded">
                  New user is registred & bought a pro package
                </span>
                <span className="w-5 h-5 flex items-center justify-center text-[10px] text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded">
                  ⇄
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                User will earn money when new user is registred & bought a pro package
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("affiliate_pro_package")}
              className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                config.affiliate_pro_package === "1" ? "bg-[#10b981]" : "bg-[#c94a4a]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold transition-transform shadow-sm ${
                  config.affiliate_pro_package === "1"
                    ? "translate-x-7 text-[#10b981]"
                    : "translate-x-0 text-[#c94a4a]"
                }`}
              >
                {config.affiliate_pro_package === "1" ? "✓" : "✕"}
              </div>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Amount %
            </label>
            <input
              type="text"
              value={config.affiliate_pro_percent || "0"}
              onChange={(e) => handleChange("affiliate_pro_percent", e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
              The price you'll pay for each new referred user. After he join any pro package.
            </span>
          </div>
        </div>

        {/* 4. New user is registered & subscribe to paid channel */}
        <div className="space-y-3 pt-2 border-b border-neutral-100 dark:border-[#292d33] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-[#ced4da] px-2.5 py-1 bg-neutral-100 dark:bg-[#181a1d] rounded">
                  New user is registred & subscrube to paid channel
                </span>
                <span className="w-5 h-5 flex items-center justify-center text-[10px] text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded">
                  ⇄
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                User will earn money when new user is registred & subscrube to paid channel
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("affiliate_paid_channel")}
              className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                config.affiliate_paid_channel === "1" ? "bg-[#10b981]" : "bg-[#c94a4a]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold transition-transform shadow-sm ${
                  config.affiliate_paid_channel === "1"
                    ? "translate-x-7 text-[#10b981]"
                    : "translate-x-0 text-[#c94a4a]"
                }`}
              >
                {config.affiliate_paid_channel === "1" ? "✓" : "✕"}
              </div>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Amount %
            </label>
            <input
              type="text"
              value={config.affiliate_channel_percent || "10"}
              onChange={(e) => handleChange("affiliate_channel_percent", e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
              The price you'll pay for each new referred user. After he subscrube to paid channel.
            </span>
          </div>
        </div>

        {/* 5. New user is registered & purchase or rent a video/movie */}
        <div className="space-y-3 pt-2 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-[#ced4da] px-2.5 py-1 bg-neutral-100 dark:bg-[#181a1d] rounded">
                  New user is registred & purchase or rent a video/movie
                </span>
                <span className="w-5 h-5 flex items-center justify-center text-[10px] text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded">
                  ⇄
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                User will earn money when new user is registred & purchase or rent a video/movie
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle("affiliate_rent_purchase")}
              className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                config.affiliate_rent_purchase === "1" ? "bg-[#10b981]" : "bg-[#c94a4a]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold transition-transform shadow-sm ${
                  config.affiliate_rent_purchase === "1"
                    ? "translate-x-7 text-[#10b981]"
                    : "translate-x-0 text-[#c94a4a]"
                }`}
              >
                {config.affiliate_rent_purchase === "1" ? "✓" : "✕"}
              </div>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Amount %
            </label>
            <input
              type="text"
              value={config.affiliate_rent_percent || "10"}
              onChange={(e) => handleChange("affiliate_rent_percent", e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
              The price you'll pay for each new referred user. After he purchase or rent a video/movie.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-[#292d33]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
