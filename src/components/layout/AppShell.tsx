"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header, Sidebar } from "./Navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Load persisted collapse state from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem("playtube_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {}
  }, []);

  // Close mobile drawer on route navigation
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

  // If inside the admin area, do not wrap with public Header/Sidebar
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex-1 flex w-full">
        <Sidebar isOpen={mobileOpen} isCollapsed={isCollapsed} />
        {/* Backdrop for mobile drawer */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          />
        )}
        <main className="flex-1 min-w-0 p-4 md:p-6 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
