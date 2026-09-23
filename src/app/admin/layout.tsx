import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Settings, 
  ShieldCheck, 
  ArrowLeft,
  DollarSign,
  Layers,
  FolderTree,
  AlertTriangle,
  BadgeCheck
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#333] flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to PlayTube</span>
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg shadow-xs">
              P
            </div>
            <span className="font-bold text-gray-800 tracking-tight text-lg">
              PlayTube <span className="text-xs bg-sky-100 text-[var(--primary)] font-semibold px-2 py-0.5 rounded-full ml-1">Admin Panel</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-[var(--primary)] font-semibold flex items-center justify-center border border-sky-200">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-xs">Administrator</span>
              <span className="text-[10px] text-emerald-600 font-medium">● Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 shrink-0 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Main
              </p>
              <nav className="space-y-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--primary)] bg-sky-50 hover:bg-sky-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--primary)]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/videos"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Video className="w-4 h-4 text-gray-400" />
                  <span>Manage Videos</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Manage Users</span>
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span>Manage Categories</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>General Settings</span>
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                Moderation & Growth
              </p>
              <nav className="space-y-1">
                <Link
                  href="/admin/verification-requests"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <BadgeCheck className="w-4 h-4 text-gray-400" />
                  <span>Verification Requests</span>
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span>Video Reports</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">PlayTube Next.js Standard</p>
            <p className="text-[11px] mt-0.5">Version 3.1.1-Huipper</p>
            <p className="text-[10px] text-gray-400 mt-2">Drizzle ORM • PostgreSQL 16</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
