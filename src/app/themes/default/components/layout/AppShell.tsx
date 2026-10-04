"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { PanelHeader } from "./PanelHeader";
import { Menu, X } from "lucide-react";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  // Load session from auth endpoint without importing authClient
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/get-session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  // Load saved sidebar collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("playtube_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) { }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("playtube_sidebar_collapsed", String(next));
        } catch (e) { }
        return next;
      });
    }
  };




  const isShortsRoute = pathname === "/shorts";

  return (
    <div
      data-theme="default"
      className={`w-full bg-[var(--default-canvas)] text-[var(--default-text)] flex flex-col transition-colors ${
        isShortsRoute
          ? "h-screen max-h-screen overflow-hidden p-0 sm:p-4 lg:p-6"
          : "min-h-screen p-2 sm:p-4 lg:p-6"
      }`}
    >
      {/* Main Container Layout */}
      <div className={`flex-1 flex gap-4 lg:gap-6 w-full mx-auto min-h-0 ${isShortsRoute ? "h-full overflow-hidden" : ""}`}>
        {/* Desktop Left Sidebar: sits directly on the canvas outside the floating panel */}
        <aside
          className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-in-out ${
            isCollapsed ? "w-16" : "w-56"
          }`}
        >
          <div className="sticky top-6 flex flex-col h-[calc(100vh-3rem)]">
            {/* Sidebar Header: Hamburger Toggle + Logo */}
            <div className={`px-2 py-2 mb-2 flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"}`}>
              {/* Hamburger Toggle Button on Sidebar */}
              <button
                type="button"
                onClick={handleToggleSidebar}
                aria-label="Toggle sidebar"
                className="p-2 rounded-xl text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo (shown only when expanded) */}
              {!isCollapsed && (
                <Link href="/" className="inline-flex items-center min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="PlayTube"
                    className="h-8 w-auto dark:hidden shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-light.png"
                    alt="PlayTube"
                    className="h-8 w-auto hidden dark:block shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </Link>
              )}
            </div>

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-none">
              <SidebarNav isLoggedIn={!!user} isCollapsed={isCollapsed} />
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
            <div className="relative w-72 max-w-[85%] h-full bg-[var(--default-canvas)] p-4 overflow-y-auto z-10 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)]/40 shrink-0">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center">
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--default-muted)] hover:text-[var(--default-text)]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav isLoggedIn={!!user} isCollapsed={false} />
              </div>
            </div>
          </div>
        )}

        {/* The Signature Large Floating Panel with 32px rounded corners and soft shadow */}
        <div
          className={`site-floating-panel flex-1 min-w-0 flex flex-col transition-shadow ${
            isShortsRoute
              ? "rounded-none sm:rounded-[32px] p-0 h-full overflow-hidden"
              : "rounded-[32px] p-4 sm:p-6 lg:p-8"
          }`}
        >
          <PanelHeader user={user} onToggleSidebar={handleToggleSidebar} />
          <main className={`flex-1 min-w-0 flex flex-col ${isShortsRoute ? "h-full overflow-hidden" : ""}`}>{children}</main>
        </div>
      </div>
    </div>
  );
}
