"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Header, Sidebar } from "./Navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If inside the admin area, do not wrap with public Header/Sidebar
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} />
        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          />
        )}
        <main className="flex-1 lg:ml-60 p-4 md:p-6 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
