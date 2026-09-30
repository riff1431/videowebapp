"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authClient } from "@/lib/auth/auth-client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarClose,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Globe,
  Users,
  Video,
  Film,
  FileText,
  FolderTree,
  Crown,
  Palette,
  Wrench,
  Flag,
  FileCode,
  Network,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  Moon,
  Sun,
  User,
  X,
  Database,
  DollarSign
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  subItems?: { title: string; href: string }[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Settings",
    icon: Settings,
    subItems: [
      { title: "General Configuration", href: "/admin/settings" },
      { title: "Website Information", href: "/admin/site-settings" },
      { title: "Import & Upload Configuration", href: "/admin/ffmpeg" },
      { title: "Video & Player Settings", href: "/admin/video-settings" },
      { title: "E-mail Setup", href: "/admin/email-settings" },
      { title: "Social Login Settings", href: "/admin/social-login" },
      { title: "Setup Live Streaming", href: "/admin/live" },
      { title: "CronJob Settings", href: "/admin/cronjob-settings" },
    ],
  },
  {
    title: "Payments & Ads",
    icon: DollarSign,
    subItems: [
      { title: "Payment Settings", href: "/admin/payment-settings" },
      { title: "Manage Website Ads", href: "/admin/ads" },
    ],
  },
  {
    title: "Languages",
    icon: Globe,
    subItems: [
      { title: "Manage Languages", href: "/admin/languages" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    subItems: [
      { title: "Manage Users", href: "/admin/users" },
      { title: "Verification Requests", href: "/admin/verification-requests" },
    ],
  },
  {
    title: "Videos",
    icon: Video,
    subItems: [
      { title: "Manage Videos", href: "/admin/videos" },
    ],
  },
  {
    title: "Movies",
    icon: Film,
    subItems: [
      { title: "Manage Movies", href: "/admin/movies" },
    ],
  },
  {
    title: "Articles",
    icon: FileText,
    subItems: [
      { title: "Manage Articles", href: "/admin/articles" },
    ],
  },
  {
    title: "Categories",
    icon: FolderTree,
    subItems: [
      { title: "Manage Categories", href: "/admin/categories" },
    ],
  },
  {
    title: "Pro System",
    icon: Crown,
    subItems: [
      { title: "Pro Settings", href: "/admin/pro-settings" },
    ],
  },
  {
    title: "Design",
    icon: Palette,
    subItems: [
      { title: "Themes", href: "/admin/themes" },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    subItems: [
      { title: "System Status", href: "/admin/system-status" },
      { title: "Backup & Restore", href: "/admin/backup" },
    ],
  },
  {
    title: "Reports",
    icon: Flag,
    subItems: [
      { title: "Video Reports", href: "/admin/reports" },
    ],
  },
  {
    title: "Pages",
    icon: FileCode,
    subItems: [
      { title: "Manage Custom Pages", href: "/admin/pages" },
    ],
  },
  {
    title: "Sitemap",
    icon: Network,
    subItems: [
      { title: "Generate Sitemap", href: "/admin/sitemap" },
    ],
  },
  {
    title: "Mobile & API Settings",
    icon: Smartphone,
    subItems: [
      { title: "API Keys", href: "/admin/api-settings" },
    ],
  },
  {
    title: "Backup",
    icon: Database,
    subItems: [
      { title: "Backup Database", href: "/admin/backup" },
    ],
  },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { openMobile, setOpenMobile } = useSidebar();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Auto expand the section containing current pathname
    for (const item of MENU_ITEMS) {
      if (item.subItems?.some((sub) => sub.href === pathname)) {
        setOpenSections((prev) => ({ ...prev, [item.title]: true }));
      }
    }
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Reusable Nav Content
  const renderNavLinks = (isMobileSheet = false) => (
    <nav className="p-2 space-y-0.5 text-xs">
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.href ? pathname === item.href : false;
        const isOpen = openSections[item.title];

        if (!item.subItems) {
          return (
            <Link
              key={item.title}
              href={item.href || "/admin"}
              onClick={() => {
                if (isMobileSheet) {
                  setOpenMobile(false);
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${isActive
                ? "text-[#04abf2] bg-[var(--admin-bg)] font-semibold"
                : "text-[var(--admin-text-main)] hover:bg-[var(--admin-card-hover)]"
                }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#04abf2]" : "text-[var(--admin-text-muted)]"
                  }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        }

        return (
          <div key={item.title}>
            <button
              onClick={() => toggleSection(item.title)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[var(--admin-text-main)] hover:bg-[var(--admin-card-hover)] font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--admin-text-muted)]" />
                <span>{item.title}</span>
              </div>
              <span className="text-[var(--admin-text-muted)] font-bold text-sm">
                {isOpen ? "-" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    onClick={() => {
                      if (isMobileSheet) {
                        setOpenMobile(false);
                      }
                    }}
                    className={`block py-1.5 px-2 rounded-sm text-[11px] transition-colors ${pathname === sub.href
                      ? "text-[#04abf2] font-semibold"
                      : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]"
                      }`}
                  >
                    {sub.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-main)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="bg-white dark:bg-[#111215] border-b border-neutral-200 dark:border-[#292d33] h-14 flex items-center justify-between px-4 sticky top-0 z-40 shadow-xs">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Mobile Sidebar Hamburger Trigger (matching PlayTube navigation-toggler) */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          <Link href="/admin" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="playtube"
              className="h-7 w-auto block dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.png"
              alt="playtube"
              className="h-7 w-auto hidden dark:block"
            />
          </Link>

          {/* Admin Search Bar */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-56 h-8 pl-8 pr-3 text-xs bg-neutral-100 dark:bg-[#1c1e22] border border-neutral-200 dark:border-[#292d33] rounded-full focus:outline-none focus:border-[#04abf2] text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-2.5" />
          </div>
        </div>

        {/* Right: Notifications & Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* Direct Day / Night mode toggle in header */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-500" />
            )}
          </button>

          <button className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-xs font-medium text-[var(--admin-text-main)] hover:opacity-80 transition-colors cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.image || "/upload/photos/d-avatar.jpg"}
                alt="admin"
                className="w-7 h-7 rounded-full object-cover bg-neutral-300 dark:bg-neutral-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
                }}
              />
              <span className="hidden sm:inline">{user?.name || user?.username || "admin"}</span>
              <ChevronDown className="w-3 h-3 text-[var(--admin-text-muted)]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg shadow-2xl py-3 z-50 text-xs">
                <div className="flex flex-col items-center px-4 pb-3 border-b border-[var(--admin-card-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.image || "/upload/photos/d-avatar.jpg"}
                    alt="admin"
                    className="w-14 h-14 rounded-full object-cover bg-neutral-300 dark:bg-neutral-700 mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
                    }}
                  />
                  <p className="font-semibold text-[var(--admin-text-main)] text-sm">
                    {user?.name || user?.username || "admin"}
                  </p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">
                    {user?.email || "admin@playtube.local"}
                  </p>

                  <Link
                    href="/"
                    className="mt-2.5 px-4 py-1 rounded-full text-xs font-medium transition-colors border"
                    style={{
                      backgroundColor: "var(--admin-bg)",
                      borderColor: "var(--admin-card-border)",
                      color: "var(--admin-text-main)"
                    }}
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/login");
                            router.refresh();
                          },
                        },
                      });
                    }}
                    className="mt-3 text-red-500 hover:text-red-400 font-semibold text-xs cursor-pointer"
                  >
                    Sign Out!
                  </button>
                </div>

                {/* Day / Night Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 pt-3 text-[var(--admin-text-main)] hover:bg-[var(--admin-card-hover)] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium">
                    {theme === "dark" ? "Day mode ☀️" : "Night mode 🌙"}
                  </span>
                  {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 relative">
        {/* Desktop Left Navigation Sidebar */}
        <aside className="w-60 bg-white dark:bg-[#111215] border-r border-neutral-200 dark:border-[#292d33] shrink-0 overflow-y-auto hidden md:block">
          {renderNavLinks(false)}
        </aside>

        {/* Mobile Drawer (shadcn sheet/sidebar style) with backdrop */}
        {openMobile && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setOpenMobile(false)}
              aria-hidden="true"
            />

            {/* Sidebar Sheet Panel */}
            <aside className="relative w-64 max-w-[80vw] bg-white dark:bg-[#111215] border-r border-neutral-200 dark:border-[#292d33] h-full overflow-y-auto shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              {/* Header inside drawer */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-[#292d33] shrink-0">
                <Link href="/admin" onClick={() => setOpenMobile(false)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="playtube"
                    className="h-6 w-auto block dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-light.png"
                    alt="playtube"
                    className="h-6 w-auto hidden dark:block"
                  />
                </Link>
                <SidebarClose />
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto py-2">
                {renderNavLinks(true)}
              </div>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f4f5fd] dark:bg-[#1c1e22] text-[#212529] dark:text-[#f1f5f9] transition-colors duration-200 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
