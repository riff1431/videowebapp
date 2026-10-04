"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SidebarNav } from "./SidebarNav";
import { PanelHeader } from "./PanelHeader";
import { Menu, X } from "lucide-react";

export interface AppShellProps {
  children: React.ReactNode;
  user?: {
    username: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
  logoSrc?: string;
  lightLogoSrc?: string;
}

export function AppShell({
  children,
  user,
  logoSrc = "/upload/photos/d-cover.jpg",
  lightLogoSrc,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[var(--default-canvas)] text-[var(--default-text)] flex flex-col p-2 sm:p-4 lg:p-6 transition-colors">
      {/* Top Mobile Bar */}
      <div className="flex lg:hidden items-center justify-between p-2 mb-2">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="PlayTube"
            className="h-7 w-auto dark:hidden"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.png"
            alt="PlayTube"
            className="h-7 w-auto hidden dark:block"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="flex-1 flex gap-4 lg:gap-6 w-full max-w-[1920px] mx-auto min-h-0">
        {/* Desktop Left Sidebar: sits directly on the canvas outside the floating panel */}
        <aside className="hidden lg:block shrink-0">
          <div className="sticky top-6 flex flex-col h-[calc(100vh-3rem)]">
            {/* Top Logo */}
            <div className="px-4 py-2 mb-2">
              <Link href="/" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="PlayTube"
                  className="h-8 w-auto dark:hidden"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-light.png"
                  alt="PlayTube"
                  className="h-8 w-auto hidden dark:block"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </Link>
            </div>

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
              <SidebarNav isLoggedIn={!!user} />
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] h-full bg-[var(--default-canvas)] p-4 overflow-y-auto z-10 shadow-2xl">
              <SidebarNav isLoggedIn={!!user} />
            </div>
          </div>
        )}

        {/* The Signature Large Floating Panel with 32px rounded corners and soft shadow */}
        <div className="site-floating-panel flex-1 min-w-0 rounded-[32px] p-4 sm:p-6 lg:p-8 flex flex-col transition-shadow">
          <PanelHeader user={user} onToggleSidebar={() => setMobileMenuOpen(true)} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
