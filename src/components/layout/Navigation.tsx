"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Upload, Bell, Menu, User, Video, Compass, Clock, ThumbsUp, Flame, Folder } from "lucide-react";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(keyword.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[var(--header-bg)] border-b border-[var(--border)] px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
        </button>
        <Link href="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center text-white">
            <Video className="w-4 h-4 fill-current" />
          </div>
          <span className="font-semibold text-lg">Play<span className="text-[var(--primary)]">Tube</span></span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:flex items-center">
        <div className="relative w-full flex">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search keyword..."
            className="w-full h-9 pl-3.5 pr-10 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-l-md focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
          />
          <button
            type="submit"
            className="h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-r-md flex items-center justify-center cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <Link
          href="/upload-video"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Upload</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors"
        >
          <User className="w-3.5 h-3.5" />
          <span>Login</span>
        </Link>
      </div>
    </header>
  );
}

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const menuItems = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Trending", href: "/videos/trending", icon: Flame },
    { label: "Latest Videos", href: "/videos/latest", icon: Video },
    { label: "History", href: "/history", icon: Clock },
    { label: "Liked Videos", href: "/liked", icon: ThumbsUp },
    { label: "Library", href: "/library", icon: Folder },
  ];

  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 z-30 w-60 bg-[var(--sidebar-bg)] border-r border-[var(--border)] transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-[var(--primary)] transition-colors"
            >
              <Icon className="w-5 h-5 text-neutral-500 group-hover:text-[var(--primary)]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
