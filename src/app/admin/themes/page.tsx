"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Palette, CheckCircle2, ExternalLink } from "lucide-react";

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

  const handleActivate = (id: string) => {
    setThemes((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === id,
      }))
    );
    setMsg("Theme activated successfully!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-white">Themes</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Design</span>
          <span>/</span>
          <span className="text-[#04abf2]">Themes</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg">
          {msg}
        </div>
      )}

      {/* Installed Themes Grid */}
      <div>
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#04abf2]" />
          <span>Installed Themes</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-[#1b1e22] border rounded-xl overflow-hidden shadow-lg transition-all ${
                theme.isActive ? "border-[#04abf2]" : "border-[#2c3136]"
              }`}
            >
              <div className="h-44 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border-b border-[#2c3136] p-4 text-center">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-light.png" alt="logo" className="h-8 mx-auto mb-2 opacity-80" />
                  <span className="text-base font-bold text-white tracking-wide">{theme.name} Theme</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-base">{theme.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      v{theme.version}
                    </span>
                  </div>
                  {theme.isActive && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Activated
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-400">{theme.description}</p>

                <p className="text-xs text-neutral-500">
                  Author: <span className="text-neutral-300 font-medium">{theme.author}</span>
                </p>

                <div className="pt-2">
                  {theme.isActive ? (
                    <button
                      disabled
                      className="w-full py-2 bg-[#04abf2]/30 text-sky-200 border border-[#04abf2]/50 rounded-md text-xs font-semibold cursor-not-allowed"
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
      <div className="pt-6 border-t border-[#2c3136]">
        <h4 className="text-sm font-bold text-white mb-4">3rd Party Themes & Extensions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1b1e22] border border-[#2c3136] rounded-xl flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-white text-xs">Playtag - The Ultimate Theme</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">Premium dark YouTube style layout for PlayTube</p>
            </div>
            <a
              href="https://codecanyon.net"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3136] hover:bg-[#383f46] text-white text-xs font-medium rounded-md transition-colors"
            >
              <span>Get Theme</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-[#1b1e22] border border-[#2c3136] rounded-xl flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-white text-xs">Vidplay - The Elegant Theme</h5>
              <p className="text-[11px] text-neutral-400 mt-0.5">Cinematic theme designed for high-resolution streaming</p>
            </div>
            <a
              href="https://codecanyon.net"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3136] hover:bg-[#383f46] text-white text-xs font-medium rounded-md transition-colors"
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
