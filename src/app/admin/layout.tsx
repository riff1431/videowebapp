"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { authClient } from "@/lib/auth/auth-client";
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
  User
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
      { title: "General Settings", href: "/admin/settings" },
      { title: "Site Features", href: "/admin/settings" },
      { title: "E-mail Setup", href: "/admin/email-settings" },
      { title: "FFmpeg Setup", href: "/admin/ffmpeg" },
    ],
  },
  {
    title: "Payments & Ads",
    icon: CreditCard,
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
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: session, isPending } = authClient.useSession();
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

  return (
    <div className="min-h-screen bg-[#16191c] text-[#e2e8f0] flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="bg-[#1b1e22] border-b border-[#2c3136] h-14 flex items-center justify-between px-4 sticky top-0 z-50">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.png"
              alt="playtube"
              className="h-7 w-auto"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </Link>

          {/* Admin Search Bar */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-56 h-8 pl-8 pr-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-full focus:outline-none focus:border-[#04abf2] text-neutral-200 placeholder-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5" />
          </div>
        </div>

        {/* Right: Notifications & Profile Dropdown */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors relative">
            <Bell className="w-4 h-4" />
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-xs font-medium text-neutral-200 hover:text-white transition-colors cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.image || "/upload/photos/d-avatar.jpg"}
                alt="admin"
                className="w-7 h-7 rounded-full object-cover bg-neutral-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
                }}
              />
              <span>{user?.name || user?.username || "admin"}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#212529] border border-[#2d3238] rounded-lg shadow-2xl py-3 z-50 text-xs">
                <div className="flex flex-col items-center px-4 pb-3 border-b border-[#2d3238]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.image || "/upload/photos/d-avatar.jpg"}
                    alt="admin"
                    className="w-14 h-14 rounded-full object-cover bg-neutral-700 mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://api.dicebear.com/7.x/bottts/svg?seed=admin";
                    }}
                  />
                  <p className="font-semibold text-white text-sm">
                    {user?.name || user?.username || "admin"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {user?.email || "admin@playtube.local"}
                  </p>
                  
                  <Link
                    href="/"
                    className="mt-2.5 px-4 py-1 bg-[#2c3136] hover:bg-[#383f46] text-white rounded-full text-xs font-medium transition-colors"
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
                    className="mt-3 text-red-400 hover:text-red-300 font-semibold text-xs cursor-pointer"
                  >
                    Sign Out!
                  </button>
                </div>

                {/* Day / Night Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 pt-3 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-xs">
                    {theme === "dark" ? "Day mode ☀️" : "Night mode 🌙"}
                  </span>
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <aside className="w-60 bg-[#1b1e22] border-r border-[#2c3136] shrink-0 overflow-y-auto hidden md:block">
          <nav className="p-2 space-y-0.5 text-xs">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isDashboard = item.href === "/admin";
              const isActive = item.href ? pathname === item.href : false;
              const isOpen = openSections[item.title];

              if (!item.subItems) {
                return (
                  <Link
                    key={item.title}
                    href={item.href || "/admin"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                      isActive
                        ? "text-[#04abf2] bg-[#16191c]"
                        : "text-neutral-300 hover:bg-[#16191c] hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#04abf2]" : "text-neutral-400"}`} />
                    <span>{item.title}</span>
                  </Link>
                );
              }

              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleSection(item.title)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-neutral-300 hover:bg-[#16191c] hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-neutral-400" />
                      <span>{item.title}</span>
                    </div>
                    <span className="text-neutral-500 font-bold text-sm">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.title}
                          href={sub.href}
                          className={`block py-1.5 px-2 rounded-sm text-[11px] transition-colors ${
                            pathname === sub.href
                              ? "text-[#04abf2] font-semibold"
                              : "text-neutral-400 hover:text-white"
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
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#16191c]">
          {children}
        </main>
      </div>
    </div>
  );
}
