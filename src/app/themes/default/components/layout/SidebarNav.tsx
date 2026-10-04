"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Video,
  History,
  DollarSign,
  FileText,
  TrendingUp,
  BarChart2,
  Clapperboard,
  Star,
  HelpCircle,
  SquarePlay,
} from "lucide-react";
import { ShortsIcon } from "@/components/common/ShortsIcon";
import { useTranslation } from "@/providers/language-provider";

export interface SidebarNavProps {
  isLoggedIn?: boolean;
  isCollapsed?: boolean;
}

export function SidebarNav({ isLoggedIn = false, isCollapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isCurrent = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const primaryLinks = [
    { href: "/", label: t("home", "Home"), icon: SquarePlay },
    { href: "/shorts", label: t("shorts", "Shorts"), icon: ShortsIcon },
    ...(isLoggedIn
      ? [
        { href: "/history", label: t("history", "History"), icon: History },
        { href: "/paid-videos", label: t("purchases", "Purchases"), icon: DollarSign },
      ]
      : []),
    { href: "/articles", label: t("articles", "Articles"), icon: FileText },
  ];

  const discoveryLinks = [
    { href: "/videos/latest", label: t("latest_videos", "Latest videos"), icon: Video },
    { href: "/videos/trending", label: t("trending", "Trending"), icon: TrendingUp },
    { href: "/videos/top", label: t("top_videos", "Top videos"), icon: BarChart2 },
    { href: "/movies", label: t("movies", "Movies"), icon: Clapperboard },
    { href: "/stock-videos", label: t("stock_videos", "Stock Videos"), icon: Video },
    { href: "/popular-channels", label: t("popular_channels", "Popular Channels"), icon: Star },
  ];

  const allCollapsedLinks = [
    ...primaryLinks,
    ...discoveryLinks,
    { href: "/contact-us", label: t("help", "Help"), icon: HelpCircle },
  ];

  // Collapsed Mode: Icon Rail (w-16) with floating tooltips
  if (isCollapsed) {
    return (
      <nav className="w-16 shrink-0 py-3 flex flex-col items-center space-y-2 select-none">
        {allCollapsedLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);
          return (
            <div key={item.href} className="relative group w-full flex justify-center">
              <Link
                href={item.href}
                title={item.label}
                data-active={active ? "true" : undefined}
                className={`relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${active
                  ? "active-nav-pill"
                  : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </Link>

              {/* Hover Tooltip */}
              <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
                {item.label}
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
              </div>
            </div>
          );
        })}
      </nav>
    );
  }

  // Expanded Mode: Full navigation sidebar (w-56, w-64 on 2xl, w-72 on 3xl)
  return (
    <nav className="w-56 2xl:w-64 3xl:w-72 shrink-0 py-4 px-2 2xl:px-3 space-y-6 2xl:space-y-8 text-xs 2xl:text-sm select-none">
      {/* 1. Primary Nav Group */}
      <div className="space-y-1 2xl:space-y-1.5">
        {primaryLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : undefined}
              className={`relative flex items-center gap-3 2xl:gap-3.5 px-4 2xl:px-5 py-2.5 2xl:py-3 rounded-full transition-all ${active
                ? "active-nav-pill font-semibold"
                : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
            >
              <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 2. Discovery Nav Group */}
      <div className="pt-4 2xl:pt-6 border-t border-[var(--border)]/40 space-y-1 2xl:space-y-1.5">
        {discoveryLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : undefined}
              className={`relative flex items-center gap-3 2xl:gap-3.5 px-4 2xl:px-5 py-2.5 2xl:py-3 rounded-full transition-all ${active
                ? "active-nav-pill font-semibold"
                : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
            >
              <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Explore More / Help */}
      <div className="pt-4 2xl:pt-6 border-t border-[var(--border)]/40 space-y-1 2xl:space-y-1.5">
        <p className="px-4 2xl:px-5 text-[10px] 2xl:text-xs font-bold text-[var(--default-muted)] uppercase tracking-wider mb-1">
          {t("explore_more", "EXPLORE MORE")}
        </p>
        <Link
          href="/contact-us"
          data-active={isCurrent("/contact-us") ? "true" : undefined}
          className={`relative flex items-center gap-3 2xl:gap-3.5 px-4 2xl:px-5 py-2.5 2xl:py-3 rounded-full transition-all ${isCurrent("/contact-us")
            ? "active-nav-pill font-semibold"
            : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
        >
          <HelpCircle className="w-4 h-4 2xl:w-5 2xl:h-5 shrink-0" />
          <span className="font-medium">{t("help", "Help")}</span>
        </Link>
      </div>

      {/* 4. Footer Links & Dynamic Copyright */}
      <div className="pt-4 2xl:pt-6 border-t border-[var(--border)]/40 px-3 2xl:px-4 text-[11px] 2xl:text-xs text-[var(--default-muted)] space-y-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/terms/refund" className="hover:underline">{t("refund", "Refund Policy")}</Link>
          <span>•</span>
          <Link href="/faqs" className="hover:underline">{t("faqs", "FAQs")}</Link>
          <span>•</span>
          <Link href="/terms/terms" className="hover:underline">{t("terms_of_use", "Terms of use")}</Link>
          <span>•</span>
          <Link href="/terms/privacy" className="hover:underline">{t("privacy_policy", "Privacy Policy")}</Link>
          <span>•</span>
          <Link href="/terms/about" className="hover:underline">{t("about_us", "About us")}</Link>
          <span>•</span>
          <Link href="/contact-us" className="hover:underline">{t("contact_us", "Contact us")}</Link>
          <span>•</span>
          <Link href="/developers" className="hover:underline">{t("developers", "Developers")}</Link>
          <span>•</span>
          <Link href="/language" className="hover:underline">{t("language", "Language")}</Link>
        </div>
        <p className="text-[10px] 2xl:text-[11px] text-[var(--default-muted)] pt-2">
          {t("copyright", "Copyright © 2026 PlayTube. All rights reserved.")}
        </p>
      </div>
    </nav>
  );
}
