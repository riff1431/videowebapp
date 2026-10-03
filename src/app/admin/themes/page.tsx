"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Palette, CheckCircle2, ExternalLink } from "lucide-react";
import { getThemesAction, activateThemeAction } from "@/modules/admin/design.actions";

interface ThemeItem {
  id: string;
  name: string;
  version: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  description: string;
  isActive: boolean;
}

const INITIAL_THEMES: ThemeItem[] = [
  {
    id: "youplay",
    name: "YouPlay",
    version: "2.8",
    author: "PlayTube Team",
    authorUrl: "https://codecanyon.net/user/doughouzforest",
    thumbnail: "/themes/youplay.png",
    description: "Modern, high-conversion responsive video theme with light & dark mode support.",
    isActive: true,
  },
  {
    id: "default",
    name: "Default PlayTube",
    version: "2.5",
    author: "PlayTube Team",
    authorUrl: "https://codecanyon.net/user/doughouzforest",
    thumbnail: "/themes/default.png",
    description: "Classic clean video layout inspired by YouTube's iconic navigation structure.",
    isActive: false,
  },
];

export default function ManageThemesPage() {
  const [themes, setThemes] = useState<ThemeItem[]>(INITIAL_THEMES);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await getThemesAction();
        if (res.success && res.activeTheme) {
          setThemes((prev) =>
            prev.map((t) => ({
              ...t,
              isActive: t.id === res.activeTheme,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load themes:", err);
      }
    }
    loadTheme();
  }, []);

  const handleActivate = async (id: string) => {
    setLoading(true);
    try {
      const res = await activateThemeAction(id);
      if (res.success) {
        setThemes((prev) =>
          prev.map((t) => ({
            ...t,
            isActive: t.id === id,
          }))
        );
        document.documentElement.setAttribute("data-theme", id);
        document.body.classList.remove("theme-youplay", "theme-default");
        document.body.classList.add(`theme-${id}`);
        setMsg(res.message || "Theme activated successfully!");
      } else {
        setMsg(res.message || "Failed to activate theme");
      }
    } catch (err: any) {
      setMsg(err.message || "Error activating theme");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3500);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[var(--admin-text-main)]">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-[var(--admin-text-main)]">Themes</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Design</span>
          <span>/</span>
          <span className="text-[#04abf2]">Themes</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-lg">
          {msg}
        </div>
      )}

      {/* Installed Themes Grid */}
      <div>
        <h4 className="text-sm font-bold text-[var(--admin-text-main)] mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#04abf2]" />
          <span>Installed Themes</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-[var(--admin-card-bg)] border rounded-xl overflow-hidden shadow-xs transition-colors duration-200 ${
                theme.isActive ? "border-[#04abf2]" : "border-[var(--admin-card-border)]"
              }`}
            >
              <div className="h-44 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-b border-[var(--admin-card-border)] p-4 text-center">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-light.png" alt="logo" className="h-8 mx-auto mb-2 opacity-80" />
                  <span className="text-base font-bold text-[var(--admin-text-main)] tracking-wide">{theme.name} Theme</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-[var(--admin-text-main)] text-base">{theme.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-[var(--admin-text-muted)] border border-[var(--admin-card-border)]">
                      v{theme.version}
                    </span>
                  </div>
                  {theme.isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activated
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--admin-text-muted)]">{theme.description}</p>

                <p className="text-xs text-[var(--admin-text-muted)]">
                  Author: <span className="text-[var(--admin-text-main)] font-medium">{theme.author}</span>
                </p>

                <div className="pt-2">
                  {theme.isActive ? (
                    <button
                      disabled
                      className="w-full py-2 bg-[#04abf2]/10 text-[#04abf2] border border-[#04abf2]/30 rounded-md text-xs font-semibold cursor-not-allowed"
                    >
                      Currently Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(theme.id)}
                      className="w-full py-2 bg-[#04abf2] hover:bg-[#039be5] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Activate Theme
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3rd Party Themes Section */}
      <div className="pt-6 border-t border-[var(--admin-card-border)]">
        <h4 className="text-sm font-bold text-[var(--admin-text-main)] mb-4">3rd Party Themes & Extensions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl flex items-center justify-between transition-colors duration-200">
            <div>
              <h5 className="font-semibold text-[var(--admin-text-main)] text-xs">Playtag - The Ultimate Theme</h5>
              <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">Premium dark YouTube style layout for PlayTube</p>
            </div>
            <a
              href="https://codecanyon.net"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-card-hover)] hover:opacity-80 text-[var(--admin-text-main)] text-xs font-medium rounded-md transition-colors border border-[var(--admin-card-border)]"
            >
              <span>Get Theme</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl flex items-center justify-between transition-colors duration-200">
            <div>
              <h5 className="font-semibold text-[var(--admin-text-main)] text-xs">Vidplay - The Elegant Theme</h5>
              <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">Cinematic theme designed for high-resolution streaming</p>
            </div>
            <a
              href="https://codecanyon.net"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-card-hover)] hover:opacity-80 text-[var(--admin-text-main)] text-xs font-medium rounded-md transition-colors border border-[var(--admin-card-border)]"
            >
              <span>Get Theme</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
