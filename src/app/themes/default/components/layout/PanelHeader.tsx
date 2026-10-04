"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Video, Bell, Globe } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getPublicImageUrl } from "@/lib/storage/image-url";

export interface PanelHeaderProps {
  user?: {
    username: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
  onToggleSidebar?: () => void;
}

export function PanelHeader({ user, onToggleSidebar }: PanelHeaderProps) {
  const router = useRouter();
  const { t, currentLang, languages, setLanguage } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const avatarUrl = user?.avatar
    ? getPublicImageUrl(user.avatar, "/upload/photos/d-avatar.jpg")
    : null;

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1 mb-6 border-b border-[var(--border)]/40 pb-4">
      {/* 1. Large Pill Search Bar with icon prefix */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative w-full flex items-center bg-[var(--default-search-bg)] border border-[var(--default-search-border)] rounded-full h-10 px-4 transition-all focus-within:ring-2 focus-within:ring-[var(--default-brand-red)]/20">
          <Search className="w-4 h-4 text-[var(--default-muted)] mr-2.5 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("search_keyword", "Search for videos...")}
            className="w-full h-full bg-transparent text-xs text-[var(--default-text)] placeholder:text-[var(--default-muted)] focus:outline-none"
          />
        </div>
      </form>

      {/* 2. Header Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Create / Upload Shortcut */}
        {user ? (
          <Link
            href="/upload-video"
            title={t("upload_video", "Upload Video")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Video className="w-4 h-4" />
          </Link>
        ) : null}

        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Language"
          >
            <Globe className="w-4 h-4" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[var(--default-panel)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.name}
                  onClick={() => {
                    setLanguage(l.name);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                    currentLang === l.name ? "font-bold text-[var(--default-brand-red)]" : "text-[var(--default-text)]"
                  }`}
                >
                  {l.displayName || l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        {user ? (
          <div className="relative">
            <NotificationBell />
          </div>
        ) : null}

        {/* User Avatar / Profile Menu */}
        {user ? (
          <Link href={`/@${user.username}`}>
            <Avatar
              src={avatarUrl}
              alt={user.name || user.username}
              size="md"
              className="ring-2 ring-[var(--default-brand-red)]/20 hover:scale-105 transition-transform"
            />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[var(--default-brand-red)] text-white hover:bg-[#d90429] shadow-xs transition-colors"
            >
              {t("login", "Sign in")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
