"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authClient } from "@/lib/auth/auth-client";
import { ShortsIcon } from "@/components/common/ShortsIcon";
import {
  Search,
  Plus,
  Video,
  Clock,
  ThumbsUp,
  Bookmark,
  FileText,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Layers,
  Sparkles,
  DollarSign,
  ChevronDown,
  MessageSquare,
  Film,
  Bell,
  Newspaper,
  Users,
  Crown,
  Wallet,
  HelpCircle,
  TrendingUp,
  BarChart2,
  Tv,
  Clapperboard,
  LogIn,
  UserPlus,
  Flame,
  Lightbulb,
  History,
  Star,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { NotificationBell } from "./NotificationBell";
import { getPublicImageUrl } from "@/lib/storage/image-url";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme, designSettings, canToggle } = useTheme();
  const { t, currentLang, languages, setLanguage } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Better Auth live session hook
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(keyword.trim())}`;
    }
  };

  const logoSrc = getPublicImageUrl(designSettings?.logo, "/logo.png") || "/logo.png";
  const lightLogoSrc = getPublicImageUrl(designSettings?.lightLogo, "/logo-light.png") || "/logo-light.png";


  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[var(--header-bg)] border-b border-[var(--border)] px-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* PlayTube 9-dot Grid Toggle Icon */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md cursor-pointer transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 276.167 276.167" fill="currentColor">
            <path d="M33.144,2.471C15.336,2.471,0.85,16.958,0.85,34.765s14.48,32.293,32.294,32.293s32.294-14.486,32.294-32.293 S50.951,2.471,33.144,2.471z" />
            <path d="M137.663,2.471c-17.807,0-32.294,14.487-32.294,32.294s14.487,32.293,32.294,32.293c17.808,0,32.297-14.486,32.297-32.293 S155.477,2.471,137.663,2.471z" />
            <path d="M243.873,67.059c17.804,0,32.294-14.486,32.294-32.293S261.689,2.471,243.873,2.471s-32.294,14.487-32.294,32.294 S226.068,67.059,243.873,67.059z" />
            <path d="M32.3,170.539c17.807,0,32.297-14.483,32.297-32.293c0-17.811-14.49-32.297-32.297-32.297S0,120.436,0,138.246 C0,156.056,14.493,170.539,32.3,170.539z" />
            <path d="M136.819,170.539c17.804,0,32.294-14.483,32.294-32.293c0-17.811-14.478-32.297-32.294-32.297 c-17.813,0-32.294,14.486-32.294,32.297C104.525,156.056,119.012,170.539,136.819,170.539z" />
            <path d="M243.038,170.539c17.811,0,32.294-14.483,32.294-32.293c0-17.811-14.483-32.297-32.294-32.297 s-32.306,14.486-32.306,32.297C210.732,156.056,225.222,170.539,243.038,170.539z" />
            <path d="M33.039,209.108c-17.807,0-32.3,14.483-32.3,32.294c0,17.804,14.493,32.293,32.3,32.293s32.293-14.482,32.293-32.293 S50.846,209.108,33.039,209.108z" />
            <path d="M137.564,209.108c-17.808,0-32.3,14.483-32.3,32.294c0,17.804,14.487,32.293,32.3,32.293 c17.804,0,32.293-14.482,32.293-32.293S155.368,209.108,137.564,209.108z" />
            <path d="M243.771,209.108c-17.804,0-32.294,14.483-32.294,32.294c0,17.804,14.49,32.293,32.294,32.293 c17.811,0,32.294-14.482,32.294-32.293S261.575,209.108,243.771,209.108z" />
          </svg>
        </button>

        {/* PlayTube Brand Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="playtube"
            className="h-7 w-auto dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightLogoSrc}
            alt="playtube"
            className="h-7 w-auto hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </Link>
      </div>

      {/* Pill Search Bar with Bright Cyan Search Button */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:flex items-center">
        <div className="relative w-full flex items-center bg-[var(--search-bg)] border border-[var(--search-border)] rounded-full overflow-hidden h-9">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t("search_keyword", "Search for videos")}
            className="w-full h-full pl-4 pr-3 text-xs bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
          />
          <button
            type="submit"
            aria-label={t("search", "Search")}
            className="h-full px-5 bg-[#04abf2] hover:bg-[#039be5] text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Language Switcher Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title={t("language", "Language")}
          >
            <Globe className="w-3.5 h-3.5 text-[#04abf2]" />
            <span className="hidden md:inline uppercase text-[11px] font-semibold tracking-wider">
              {currentLang.slice(0, 2)}
            </span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-[var(--card-bg)] text-[var(--foreground)] rounded-lg shadow-2xl border border-[var(--border)] py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-[var(--border)]">
                {t("language", "Language")}
              </div>
              {languages.map((l) => (
                <button
                  key={l.name}
                  type="button"
                  onClick={async () => {
                    setLangMenuOpen(false);
                    await setLanguage(l.name);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                    currentLang === l.name
                      ? "text-[#04abf2] font-semibold bg-black/5 dark:bg-white/5"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <span>{l.displayName || l.name}</span>
                  {currentLang === l.name && (
                    <span className="text-[10px] text-[#04abf2]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="relative" ref={createMenuRef}>
          <button
            onClick={() => {
              if (!isLoggedIn) {
                router.push("/login?redirect=" + encodeURIComponent("/upload-video"));
              } else {
                setCreateMenuOpen(!createMenuOpen);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">{t("upload", "Create")}</span>
          </button>

          {isLoggedIn && createMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#212121] rounded-lg shadow-2xl border border-[var(--border)] py-1.5 z-50 text-xs">
              <Link
                href="/upload-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Video className="w-4 h-4 text-[#04abf2]" />
                <span>{t("upload_new_video", "Upload Video")}</span>
              </Link>
              <Link
                href="/import-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>{t("import", "Import Video")}</span>
              </Link>
              <Link
                href="/shorts"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{t("shorts", "PlayTube Shorts")}</span>
              </Link>
              <Link
                href="/create-article"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Newspaper className="w-4 h-4 text-amber-500" />
                <span>{t("create_article", "Create Article")}</span>
              </Link>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <>
            {/* Message Icon */}
            <Link
              href="/messages"
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            {/* Notification Bell */}
            <NotificationBell />
          </>
        )}

        {/* User Account Dropdown (Exact PlayTube Parity) */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:opacity-80 transition-opacity cursor-pointer pl-1"
          >
            <span className="hidden sm:inline text-xs">My Account</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPublicImageUrl(user?.image, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
              alt="Account"
              className="w-7 h-7 rounded-full object-cover bg-neutral-200 border border-neutral-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
              }}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] text-[var(--foreground)] rounded-lg shadow-2xl border border-[var(--border)] py-1.5 z-50 text-xs">
              {isLoggedIn ? (
                <>
                  {/* Account Header Info */}
                  <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPublicImageUrl(user?.image, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">
                        {user?.name || user?.username || "User"}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        @{user?.username || user?.name || "user"}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {user?.points || 0} Points
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher (Day / Night - only visible if toggleable) */}
                  {canToggle && (
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[#fad657] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-b border-[var(--border)] cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-[#fad657] fill-[#fad657]" />
                      <span>{t("night_mode", "Mode")}</span>
                    </button>
                  )}

                  {/* PlayTube User Actions */}
                  <div className="py-1">
                    <Link
                      href="/switch-account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("switch_account", "Switch Account")}</span>
                    </Link>
                    <Link
                      href="/subscriptions"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("subscriptions", "Subscriptions")}</span>
                    </Link>
                    <Link
                      href="/wallet"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("wallet", "Wallet")}</span>
                    </Link>
                    <Link
                      href="/saved-videos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("playlists", "PlayLists")}</span>
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("history", "History")}</span>
                    </Link>
                  </div>

                  <div className="py-1 border-t border-[var(--border)]">
                    <Link
                      href="/liked-videos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("liked_videos", "Liked videos")}</span>
                    </Link>
                    <Link
                      href="/my_articles?page_id=1"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("my_articles", "My articles")}</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Video className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("video_studio", "Video Studio")}</span>
                    </Link>
                    <Link
                      href="/settings/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("edit", "Edit")}</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("settings", "Settings")}</span>
                    </Link>
                    <Link
                      href="/ads"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Layers className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                      <span>{t("advertising", "Advertising")}</span>
                    </Link>
                    {(user?.role === "admin" || user?.isAdmin) && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-[#04abf2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-[var(--border)]"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#04abf2]" />
                        <span className="font-medium text-[#04abf2]">
                          {t("admin_panel", "Admin Panel")}
                        </span>
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              router.push("/login");
                              router.refresh();
                            },
                          },
                        });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t("log_out", "Log out")}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Logged Out Dropdown */}
                  {canToggle && (
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[#fad657] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium border-b border-[var(--border)] cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-[#fad657] fill-[#fad657]" />
                      <span>{t("night_mode", "Mode")}</span>
                    </button>
                  )}
                  <Link
                    href="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>{t("login", "Login")}</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>{t("register", "Register")}</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Sidebar({
  isOpen,
  isCollapsed = false,
}: {
  isOpen: boolean;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const isCurrent = (path: string) => pathname === path;

  // Primary links used in mini sidebar mode
  const miniLinks = [
    { href: "/", label: t("home", "Home"), icon: Video },
    ...(isLoggedIn
      ? [
        { href: "/history", label: t("history", "History"), icon: History },
        { href: "/paid-videos", label: t("purchases", "Purchases"), icon: DollarSign },
      ]
      : []),
    { href: "/articles", label: t("articles", "Articles"), icon: FileText },
    { href: "/videos/latest", label: t("latest_videos", "Latest videos"), icon: Video },
    { href: "/videos/trending", label: t("trending", "Trending"), icon: TrendingUp },
    { href: "/videos/top", label: t("top_videos", "Top videos"), icon: BarChart2 },
    { href: "/movies", label: t("movies", "Movies"), icon: Clapperboard },
    { href: "/stock-videos", label: t("stock_videos", "Stock Videos"), icon: Video },
    { href: "/popular-channels", label: t("popular_channels", "Popular Channels"), icon: Star },
    { href: "/shorts", label: t("shorts", "Shorts"), icon: ShortsIcon },
    { href: "/contact-us", label: t("help", "Help"), icon: HelpCircle },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] bg-[var(--sidebar-bg)] border-r border-[var(--border)] shrink-0 overflow-y-auto overflow-x-hidden transition-[width,transform] duration-200 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-16 w-60" : "w-60"}`}
    >
      {/* Mini Icon-Only Rail for Collapsed Desktop */}
      {isCollapsed && (
        <div className="hidden lg:flex flex-col items-center py-3 space-y-1.5 w-full">
          {miniLinks.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);
            return (
              <div key={item.href} className="relative group w-full flex justify-center">
                <Link
                  href={item.href}
                  title={item.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${active
                    ? "bg-black/5 dark:bg-white/10 text-[#04abf2]"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-[#04abf2]" : ""}`} />
                </Link>

                {/* Floating Tooltip */}
                <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[11px] font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
                  {item.label}
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900 dark:border-r-neutral-800" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Expanded Sidebar Menu */}
      <div className={`${isCollapsed ? "lg:hidden" : "block"} p-3 space-y-6 text-xs w-60`}>
        {/* Top Group */}
        <div className="space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/")
              ? "font-semibold text-neutral-900 dark:text-white bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <Video className={`w-4 h-4 ${isCurrent("/") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("home", "Home")}</span>
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/history"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/history")
                  ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                {isCurrent("/history") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
                )}
                <History className={`w-4 h-4 ${isCurrent("/history") ? "text-[#04abf2]" : "text-neutral-500"}`} />
                <span>{t("history", "History")}</span>
              </Link>
              <Link
                href="/paid-videos"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/paid-videos")
                  ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                {isCurrent("/paid-videos") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
                )}
                <DollarSign className={`w-4 h-4 ${isCurrent("/paid-videos") ? "text-[#04abf2]" : "text-neutral-500"}`} />
                <span>{t("purchases", "Purchases")}</span>
              </Link>
            </>
          )}

          <Link
            href="/articles"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/articles")
              ? "font-semibold text-neutral-900 dark:text-white bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/articles") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <FileText className={`w-4 h-4 ${isCurrent("/articles") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("articles", "Articles")}</span>
          </Link>
        </div>

        {/* Discovery Group */}
        <div className="pt-2 border-t border-[var(--border)] space-y-1">
          <Link
            href="/videos/latest"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/videos/latest")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/videos/latest") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <Video className={`w-4 h-4 ${isCurrent("/videos/latest") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("latest_videos", "Latest videos")}</span>
          </Link>
          <Link
            href="/videos/trending"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/videos/trending")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/videos/trending") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <TrendingUp className={`w-4 h-4 ${isCurrent("/videos/trending") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("trending", "Trending")}</span>
          </Link>
          <Link
            href="/videos/top"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/videos/top")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/videos/top") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <BarChart2 className={`w-4 h-4 ${isCurrent("/videos/top") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("top_videos", "Top videos")}</span>
          </Link>
          <Link
            href="/movies"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/movies")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/movies") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <Clapperboard className={`w-4 h-4 ${isCurrent("/movies") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("movies", "Movies")}</span>
          </Link>
          <Link
            href="/stock-videos"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/stock-videos")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/stock-videos") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <Video className={`w-4 h-4 ${isCurrent("/stock-videos") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("stock_videos", "Stock Videos")}</span>
          </Link>
          <Link
            href="/popular-channels"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/popular-channels")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/popular-channels") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <Star className={`w-4 h-4 ${isCurrent("/popular-channels") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("popular_channels", "Popular Channels")}</span>
          </Link>
          <Link
            href="/shorts"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative ${isCurrent("/shorts")
              ? "font-semibold text-[#04abf2] bg-black/5 dark:bg-white/5"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            {isCurrent("/shorts") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#04abf2] absolute left-1" />
            )}
            <ShortsIcon className={`w-4 h-4 ${isCurrent("/shorts") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("shorts", "Shorts")}</span>
          </Link>
        </div>

        {/* Explore More Group */}
        <div className="pt-2 border-t border-[var(--border)] space-y-1">
          <p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            {t("explore_more", "EXPLORE MORE")}
          </p>
          <Link
            href="/contact-us"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isCurrent("/contact-us")
              ? "bg-black/5 dark:bg-white/10 text-[#04abf2] font-semibold"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
          >
            <HelpCircle className={`w-4 h-4 ${isCurrent("/contact-us") ? "text-[#04abf2]" : "text-neutral-500"}`} />
            <span>{t("help", "Help")}</span>
          </Link>
        </div>

        {/* Footer Links & Copyright */}
        <div className="pt-4 border-t border-[var(--border)] px-3 text-[11px] text-neutral-500 space-y-2">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="/terms/refund" className="hover:underline">{t("refund", "Refund Policy")}</Link>
            <span>•</span>
            <Link href="/faqs" className="hover:underline">{t("faqs", "FAQs")}</Link>
            <span>•</span>
            <Link href="/terms/terms" className="hover:underline">{t("terms_of_use", "Terms of use")}</Link>
            <span>•</span>
            <Link href="/terms/privacy" className="hover:underline">{t("privacy_policy", "Privacy Policy")}</Link>
            <span>•</span>
            <Link href="/terms/about" className="hover:underline">{t("about_us", "About us")}</Link>
            <span>•</span>
            <Link href="/contact-us" className="hover:underline">{t("contact_us", "Contact us")}</Link>
            <span>•</span>
            <Link href="/developers" className="hover:underline">{t("developers", "Developers")}</Link>
            <span>•</span>
            <Link href="/language" className="hover:underline">{t("language", "Language")}</Link>
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 pt-2">
            {t("copyright", "Copyright © 2026 PlayTube. All rights reserved.")}
          </p>
        </div>
      </div>
    </aside>
  );
}
