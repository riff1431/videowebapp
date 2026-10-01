"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import {
  getSiteDesignSettingsAction,
  saveSiteDesignSettingsAction,
  uploadDesignAssetAction,
} from "@/modules/admin/design.actions";
import {
  Home,
  ChevronRight,
  Paperclip,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ChangeSiteDesignPage() {
  const [favicon, setFavicon] = useState("/favicon.ico");
  const [logo, setLogo] = useState("/logo.png");
  const [lightLogo, setLightLogo] = useState("/logo-light.png");
  const [nightMode, setNightMode] = useState("night_default");

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await getSiteDesignSettingsAction();
    if (res.success) {
      setFavicon(res.data.favicon);
      setLogo(res.data.logo);
      setLightLogo(res.data.lightLogo);
      setNightMode(res.data.nightMode);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileUpload = async (type: "favicon" | "logo" | "light_logo", file: File) => {
    setNotice(null);
    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);

      const res = await uploadDesignAssetAction(formData);
      if (res.success && res.url) {
        if (type === "favicon") setFavicon(res.url);
        if (type === "logo") setLogo(res.url);
        if (type === "light_logo") setLightLogo(res.url);
        setNotice({ type: "success", text: res.message || "Asset uploaded successfully!" });
      } else {
        setNotice({ type: "error", text: res.message || "Failed to upload asset" });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Upload error" });
    } finally {
      setUploadingType(null);
    }
  };

  const handleSaveMode = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    startTransition(async () => {
      const res = await saveSiteDesignSettingsAction({ nightMode });
      if (res.success) {
        setNotice({ type: "success", text: res.message || "Settings saved successfully! Reloading..." });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setNotice({ type: "error", text: res.message || "Failed to save settings" });
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Change Site Design
        </h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <Link href="/admin" className="hover:text-cyan-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            Admin Panel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Design</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Change Site Design</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-6 space-y-6">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Change Site Design
          </h2>

          {notice && (
            <div
              className={`p-3.5 rounded text-sm flex items-center gap-2.5 ${
                notice.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Asset Upload Buttons */}
          <div className="space-y-4">
            {/* Favicon Upload */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={faviconInputRef}
                accept="image/x-icon,image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload("favicon", e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingType === "favicon"}
                className="w-12 h-12 rounded-full bg-[#00adef]/15 hover:bg-[#00adef]/25 text-[#00adef] flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {uploadingType === "favicon" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Paperclip className="w-6 h-6" />
                )}
              </button>
              <div className="flex-1">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">Favicon</span>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Current: {favicon}
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/x-png,image/gif,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload("logo", e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingType === "logo"}
                className="w-12 h-12 rounded-full bg-[#00adef]/15 hover:bg-[#00adef]/25 text-[#00adef] flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {uploadingType === "logo" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </button>
              <div className="flex-1">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">Logo</span>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Current: {logo}
                </div>
              </div>
            </div>

            {/* Light Logo Upload */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={lightLogoInputRef}
                accept="image/x-png,image/gif,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload("light_logo", e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => lightLogoInputRef.current?.click()}
                disabled={uploadingType === "light_logo"}
                className="w-12 h-12 rounded-full bg-[#00adef]/15 hover:bg-[#00adef]/25 text-[#00adef] flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {uploadingType === "light_logo" ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                    Light Logo
                  </span>
                  <span className="text-xs text-[#00adef] hover:underline cursor-pointer">
                    (What is this?)
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  Current: {lightLogo}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-200 dark:border-[#292d33]" />

          {/* Design Mode Radio Form */}
          <form onSubmit={handleSaveMode} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Design Mode
              </label>

              <div className="space-y-2.5">
                {/* Night & Light (Default: light, Toggle) */}
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="night_mode"
                    value="both"
                    checked={nightMode === "both"}
                    onChange={(e) => setNightMode(e.target.value)}
                    className="accent-[#00adef] w-4 h-4 cursor-pointer"
                  />
                  <span>Night &amp; Light (Default: light, Toggle)</span>
                </label>

                {/* Night & Light (Default: night, Toggle) */}
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="night_mode"
                    value="night_default"
                    checked={nightMode === "night_default"}
                    onChange={(e) => setNightMode(e.target.value)}
                    className="accent-[#00adef] w-4 h-4 cursor-pointer"
                  />
                  <span>Night &amp; Light (Default: night, Toggle)</span>
                </label>

                {/* Night */}
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="night_mode"
                    value="night"
                    checked={nightMode === "night"}
                    onChange={(e) => setNightMode(e.target.value)}
                    className="accent-[#00adef] w-4 h-4 cursor-pointer"
                  />
                  <span>Night</span>
                </label>

                {/* Light */}
                <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="night_mode"
                    value="light"
                    checked={nightMode === "light"}
                    onChange={(e) => setNightMode(e.target.value)}
                    className="accent-[#00adef] w-4 h-4 cursor-pointer"
                  />
                  <span>Light</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Please make sure to clean your browser cache after changing the design settings.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || loading}
                className="px-6 py-2.5 bg-[#00adef] hover:bg-[#0096d6] text-white font-medium text-sm rounded shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
