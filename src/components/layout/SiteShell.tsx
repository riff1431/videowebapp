"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header, Sidebar } from "@/components/layout/Navigation";

export function SiteShell({
  themeId,
  children,
}: {
  themeId: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("playtube_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
      if (typeof document !== "undefined") {
        setIsPreview(document.cookie.includes("playtube_theme_preview"));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("playtube_sidebar_collapsed", String(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/reset-password");

  return (
    <div data-theme={themeId} className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Admin Preview Banner if previewing */}
      {isPreview && (
        <div className="bg-amber-500 text-black px-4 py-1.5 text-xs font-semibold flex items-center justify-between z-50 sticky top-0 shadow-sm">
          <span>Previewing theme: {themeId}</span>
          <a
            href="/?preview_theme=exit"
            className="bg-black text-white px-2.5 py-0.5 rounded text-[11px] hover:bg-neutral-800 transition"
          >
            Exit Preview
          </a>
        </div>
      )}

      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex-1 flex w-full">
        {!isAuthPage && (
          <>
            <Sidebar isOpen={mobileOpen} isCollapsed={isCollapsed} />
            {mobileOpen && (
              <div
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              />
            )}
          </>
        )}
        <main
          className={`flex-1 min-w-0 w-full overflow-x-hidden ${
            isAuthPage
              ? "p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-[#f4f5f7] dark:bg-[#0f0f0f]"
              : "p-4 md:p-6"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
