"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Video,
  Bell,
  Globe,
  Menu,
  Check,
  User,
  Settings,
  History,
  DollarSign,
  Bookmark,
  ThumbsUp,
  FileText,
  ShieldAlert,
  LogOut,
  Sparkles,
  Layers,
  Newspaper,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getPublicImageUrl } from "@/lib/storage/image-url";

export interface PanelHeaderProps {
  user?: {
    id?: number | string;
    username: string;
    name?: string | null;
    avatar?: string | null;
    role?: string | null;
    isAdmin?: boolean | null;
    points?: number | null;
  } | null;
  onToggleSidebar?: () => void;
}

export function PanelHeader({ user, onToggleSidebar }: PanelHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, currentLang, languages, setLanguage } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const avatarUrl = user?.avatar
    ? getPublicImageUrl(user.avatar, "/upload/photos/d-avatar.jpg")
    : null;

  // Derive Left Title: Greeting on Home, or contextual page title on sub-routes
  const getHeaderTitle = () => {
    if (pathname === "/") {
      const displayName = user?.name || user?.username || "Friend";
      return (
        <span className="flex items-center gap-2">
          <span>Hey {displayName}, Have a good day!</span>
          <span className="inline-block hover:scale-110 transition-transform select-none">
            👋
          </span>
        </span>
      );
    }
    if (pathname === "/history") return t("history", "History");
    if (pathname === "/subscriptions") return t("subscriptions", "Subscriptions");
    if (pathname === "/liked-videos") return t("liked_videos", "Liked Videos");
    if (pathname === "/paid-videos") return t("purchases", "Purchases");
    if (pathname === "/articles" || pathname.startsWith("/articles")) return t("articles", "Articles");
    if (pathname === "/videos/trending") return t("trending", "Trending");
    if (pathname === "/videos/latest") return t("latest_videos", "Latest Videos");
    if (pathname === "/videos/top") return t("top_videos", "Top Videos");
    if (pathname === "/movies") return t("movies", "Movies");
    if (pathname === "/stock-videos") return t("stock_videos", "Stock Videos");
    if (pathname === "/popular-channels") return t("popular_channels", "Popular Channels");
    if (pathname === "/shorts") return t("shorts", "Shorts");
    if (pathname.startsWith("/search")) return t("search_results", "Search Results");
    if (pathname === "/settings" || pathname.startsWith("/settings")) return t("settings", "Settings");
    if (pathname === "/dashboard") return t("dashboard", "Video Studio");
    if (pathname === "/contact-us") return t("contact_us", "Contact Us");
    if (pathname === "/faqs") return t("faqs", "FAQs");
    return null;
  };

  const titleContent = getHeaderTitle();

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1 mb-6 border-b border-[var(--border)]/40 pb-4">
      {/* 1. Left: Hamburger Toggle Trigger + Greeting / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="p-2 rounded-xl text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {titleContent && (
          <h1 className="text-base sm:text-xl font-bold text-[var(--default-text)] tracking-tight truncate">
            {titleContent}
          </h1>
        )}
      </div>

      {/* 2. Center/Right: Pill Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
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

      {/* 3. Header Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Create / Upload Shortcut Dropdown */}
        <div className="relative">
          {user ? (
            <button
              type="button"
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              title={t("upload_video", "Upload Video")}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>
          ) : null}

          {createMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--default-panel)] border border-[var(--border)] rounded-2xl shadow-xl py-1.5 z-50 text-xs">
              <Link
                href="/upload-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Video className="w-4 h-4 text-[var(--default-brand-red)]" />
                <span>{t("upload_new_video", "Upload Video")}</span>
              </Link>
              <Link
                href="/import-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>{t("import", "Import Video")}</span>
              </Link>
              <Link
                href="/shorts"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{t("shorts", "Shorts")}</span>
              </Link>
              <Link
                href="/create-article"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Newspaper className="w-4 h-4 text-amber-500" />
                <span>{t("create_article", "Create Article")}</span>
              </Link>
            </div>
          )}
        </div>

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
            <div className="absolute right-0 mt-2 w-40 max-h-72 overflow-y-auto bg-[var(--default-panel)] border border-[var(--border)] rounded-2xl shadow-xl py-1 z-50 text-xs">
              {languages.map((l) => (
                <button
                  key={l.name}
                  onClick={() => {
                    setLanguage(l.name);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${currentLang === l.name ? "font-bold text-[var(--default-brand-red)]" : "text-[var(--default-text)]"
                    }`}
                >
                  <span>{l.displayName || l.name}</span>
                  {currentLang === l.name && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        {user ? (
          <div className="relative">
            <NotificationBell />
          </div>
        ) : null}

        {/* User Avatar & Dropdown Menu */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="cursor-pointer flex items-center focus:outline-none"
            >
              <Avatar
                src={avatarUrl}
                alt={user.name || user.username}
                size="md"
                className="ring-2 ring-[var(--default-brand-red)]/20 hover:scale-105 transition-transform"
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--default-panel)] border border-[var(--border)] rounded-2xl shadow-2xl py-2 z-50 text-xs">
                {/* User info banner */}
                <div className="px-4 py-2 border-b border-[var(--border)]/60">
                  <p className="font-bold text-[var(--default-text)] truncate">
                    {user.name || user.username}
                  </p>
                  <p className="text-[11px] text-[var(--default-muted)] truncate">
                    @{user.username}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={`/@${user.username}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("my_channel", "My Channel")}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Video className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("video_studio", "Video Studio")}</span>
                  </Link>
                  <Link
                    href="/subscriptions"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Users className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("subscriptions", "Subscriptions")}</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <History className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("history", "History")}</span>
                  </Link>
                  <Link
                    href="/liked-videos"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("liked_videos", "Liked Videos")}</span>
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("wallet", "Wallet")}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[var(--default-muted)]" />
                    <span>{t("settings", "Settings")}</span>
                  </Link>
                  {(user.role === "admin" || user.isAdmin) && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[var(--default-brand-red)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-t border-[var(--border)]/60"
                    >
                      <ShieldAlert className="w-4 h-4 text-[var(--default-brand-red)]" />
                      <span>{t("admin_panel", "Admin Panel")}</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      try {
                        await fetch("/api/auth/sign-out", { credentials: "omit", method: "POST" });
                      } catch (e) { }
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer border-t border-[var(--border)]/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("logout", "Log Out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[var(--default-brand-red)] text-white hover:opacity-95 shadow-xs transition-opacity"
            >
              {t("login", "Sign in")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
