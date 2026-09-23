"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Upload,
  Plus,
  Video,
  Flame,
  Clock,
  ThumbsUp,
  Bookmark,
  Compass,
  FileText,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Folder,
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
} from "lucide-react";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [keyword, setKeyword] = useState("");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[var(--header-bg)] border-b border-[var(--border)] px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* PlayTube 9-dot Grid Toggle Icon */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors"
        >
          <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-200" viewBox="0 0 276.167 276.167" fill="currentColor">
            <path d="M33.144,2.471C15.336,2.471,0.85,16.958,0.85,34.765s14.48,32.293,32.294,32.293s32.294-14.486,32.294-32.293 S50.951,2.471,33.144,2.471z"/>
            <path d="M137.663,2.471c-17.807,0-32.294,14.487-32.294,32.294s14.487,32.293,32.294,32.293c17.808,0,32.297-14.486,32.297-32.293 S155.477,2.471,137.663,2.471z"/>
            <path d="M243.873,67.059c17.804,0,32.294-14.486,32.294-32.293S261.689,2.471,243.873,2.471s-32.294,14.487-32.294,32.294 S226.068,67.059,243.873,67.059z"/>
            <path d="M32.3,170.539c17.807,0,32.297-14.483,32.297-32.293c0-17.811-14.49-32.297-32.297-32.297S0,120.436,0,138.246 C0,156.056,14.493,170.539,32.3,170.539z"/>
            <path d="M136.819,170.539c17.804,0,32.294-14.483,32.294-32.293c0-17.811-14.478-32.297-32.294-32.297 c-17.813,0-32.294,14.486-32.294,32.297C104.525,156.056,119.012,170.539,136.819,170.539z"/>
            <path d="M243.038,170.539c17.811,0,32.294-14.483,32.294-32.293c0-17.811-14.483-32.297-32.294-32.297 s-32.306,14.486-32.306,32.297C210.732,156.056,225.222,170.539,243.038,170.539z"/>
            <path d="M33.039,209.108c-17.807,0-32.3,14.483-32.3,32.294c0,17.804,14.493,32.293,32.3,32.293s32.293-14.482,32.293-32.293 S50.846,209.108,33.039,209.108z"/>
            <path d="M137.564,209.108c-17.808,0-32.3,14.483-32.3,32.294c0,17.804,14.487,32.293,32.3,32.293 c17.804,0,32.293-14.482,32.293-32.293S155.368,209.108,137.564,209.108z"/>
            <path d="M243.771,209.108c-17.804,0-32.294,14.483-32.294,32.294c0,17.804,14.49,32.293,32.294,32.293 c17.811,0,32.294-14.482,32.294-32.293S261.575,209.108,243.771,209.108z"/>
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white shadow-xs">
            <Video className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight">Play<span className="text-[var(--primary)]">Tube</span></span>
        </Link>
      </div>

      {/* Pill Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:flex items-center">
        <div className="relative w-full flex">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search videos, channels..."
            className="w-full h-9 pl-4 pr-10 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-l-full focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
          />
          <button
            type="submit"
            aria-label="Search"
            className="h-9 px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-r-full flex items-center justify-center cursor-pointer transition-colors shadow-xs"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* Create Dropdown (Upload Video, Import Video, Upload Shorts) */}
        <div className="relative" ref={createMenuRef}>
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-[var(--border)] py-1.5 z-50 text-sm">
              <Link
                href="/upload-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Upload Video</span>
              </Link>
              <Link
                href="/import-video"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Video className="w-4 h-4 text-emerald-500" />
                <span>Import Video</span>
              </Link>
              <Link
                href="/shorts"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>PlayTube Shorts</span>
              </Link>
              <Link
                href="/create-article"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Newspaper className="w-4 h-4 text-amber-500" />
                <span>Create Article</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Account Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/upload/photos/d-avatar.jpg"
              alt="Account"
              className="w-8 h-8 rounded-full object-cover bg-neutral-200 border border-[var(--border)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60";
              }}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-[var(--border)] py-1.5 z-50 text-sm">
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">Administrator</p>
                <p className="text-xs text-neutral-500 truncate">@admin</p>
              </div>

              <Link
                href="/channel/admin"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <User className="w-4 h-4 text-neutral-500" />
                <span>My Channel</span>
              </Link>
              <Link
                href="/subscriptions"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>Subscriptions</span>
              </Link>
              <Link
                href="/saved-videos"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-neutral-500" />
                <span>Saved Videos</span>
              </Link>
              <Link
                href="/manage-videos"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Film className="w-4 h-4 text-neutral-500" />
                <span>Manage Videos</span>
              </Link>
              <Link
                href="/go-pro"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors font-medium"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Go Pro (VIP)</span>
              </Link>
              <Link
                href="/wallet"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Wallet className="w-4 h-4 text-neutral-500" />
                <span>Wallet & Earnings</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-500" />
                <span>Settings</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-t border-[var(--border)]"
              >
                <ShieldAlert className="w-4 h-4 text-[var(--primary)]" />
                <span className="font-medium text-[var(--primary)]">Admin Panel</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Sign Out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const discoveryItems = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Trending", href: "/videos/trending", icon: Flame },
    { label: "Latest Videos", href: "/videos/latest", icon: Video },
    { label: "Top Videos", href: "/videos/top", icon: Sparkles },
    { label: "Shorts", href: "/shorts", icon: Sparkles },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "Articles", href: "/articles", icon: Newspaper },
    { label: "Popular Channels", href: "/popular-channels", icon: Users },
  ];

  const libraryItems = [
    { label: "Subscriptions", href: "/subscriptions", icon: Layers },
    { label: "History", href: "/history", icon: Clock },
    { label: "Liked Videos", href: "/liked-videos", icon: ThumbsUp },
    { label: "Saved Videos", href: "/saved-videos", icon: Bookmark },
  ];

  const footerLinks = [
    { label: "Terms of Use", href: "/terms/terms" },
    { label: "Privacy Policy", href: "/terms/privacy" },
    { label: "About Us", href: "/terms/about" },
    { label: "Contact Us", href: "/contact-us" },
  ];

  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 z-30 w-60 bg-[var(--sidebar-bg)] border-r border-[var(--border)] overflow-y-auto transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-3 space-y-4">
        {/* Discovery Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">Discover</p>
          {discoveryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-[var(--primary)] transition-colors"
              >
                <Icon className="w-4 h-4 text-neutral-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)]" />

        {/* Library Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">My Library</p>
          {libraryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-[var(--primary)] transition-colors"
              >
                <Icon className="w-4 h-4 text-neutral-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)]" />

        {/* Footer info links */}
        <div className="px-3 py-2 text-xs text-neutral-400 space-y-2">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:underline hover:text-neutral-600 dark:hover:text-neutral-300">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400/80 pt-2">© 2026 PlayTube Inc.</p>
        </div>
      </div>
    </aside>
  );
}
