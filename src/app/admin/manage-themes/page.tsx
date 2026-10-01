"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getThemesAction,
  activateThemeAction,
} from "@/modules/admin/design.actions";
import {
  Home,
  ChevronRight,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function ManageThemesPage() {
  const [activeTheme, setActiveTheme] = useState("default");
  const [themes, setThemes] = useState<any[]>([]);
  const [thirdPartyThemes, setThirdPartyThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingKey, setActivatingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchThemes = async () => {
    setLoading(true);
    const res = await getThemesAction();
    if (res.success) {
      setActiveTheme(res.activeTheme);
      setThemes(res.themes);
      setThirdPartyThemes(res.thirdPartyThemes);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleActivate = async (key: string) => {
    setNotice(null);
    setActivatingKey(key);
    try {
      const res = await activateThemeAction(key);
      if (res.success) {
        setActiveTheme(key);
        setNotice({ type: "success", text: res.message || `Theme ${key} activated successfully!` });
      } else {
        setNotice({ type: "error", text: res.message || "Failed to activate theme" });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Error activating theme" });
    } finally {
      setActivatingKey(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Themes
        </h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <Link href="/admin" className="hover:text-cyan-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            Admin Panel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Design</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Themes</span>
        </div>
      </div>

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

      {/* Built-in System Themes (Default, YouPlay) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isCurrent = activeTheme.toLowerCase() === theme.key.toLowerCase();
          const isActivating = activatingKey === theme.key;

          return (
            <div
              key={theme.key}
              className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {theme.name}
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#e91e63] text-white rounded">
                    v{theme.version}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  <Palette className="w-3.5 h-3.5 shrink-0" />
                  <span>Author:</span>
                  <a
                    href={theme.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00adef] hover:underline"
                  >
                    {theme.author}
                  </a>
                </div>
              </div>

              <div className="pt-2">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2 bg-[#2d7d9a] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-default opacity-90 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activated</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleActivate(theme.key)}
                    disabled={isActivating || loading}
                    className="px-6 py-2 bg-[#00adef] hover:bg-[#0096d6] text-white text-xs font-semibold rounded transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isActivating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Activate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <hr className="border-neutral-200 dark:border-[#292d33] my-6" />

      {/* 3rd Party Themes Section */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-neutral-900 dark:text-white">3rd Party Themes</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {thirdPartyThemes.map((theme, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-6 flex items-center gap-4"
            >
              <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-100 dark:bg-[#1c1e22] shrink-0 border border-neutral-200 dark:border-[#292d33] flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.logo}
                  alt={theme.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              <div className="flex-1 space-y-3">
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  {theme.name}
                </h5>
                <div>
                  <a
                    href={theme.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00adef] hover:bg-[#0096d6] text-white text-xs font-semibold rounded transition shadow-sm"
                  >
                    <span>Get Theme</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
