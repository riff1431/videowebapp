"use client";

import React from "react";
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
} from "lucide-react";
import { ShortsIcon } from "@/components/common/ShortsIcon";
import { useTranslation } from "@/providers/language-provider";

export interface SidebarNavProps {
  isLoggedIn?: boolean;
}

export function SidebarNav({ isLoggedIn = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isCurrent = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const primaryLinks = [
    { href: "/", label: t("home", "Home"), icon: Video },
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
    { href: "/shorts", label: t("shorts", "Shorts"), icon: ShortsIcon },
  ];

  return (
    <nav className="w-56 shrink-0 py-4 px-2 space-y-6 text-xs select-none">
      {/* 1. Primary Nav Group */}
      <div className="space-y-1">
        {primaryLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : undefined}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-full transition-all ${
                active
                  ? "active-nav-pill"
                  : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 2. Discovery Nav Group */}
      <div className="pt-4 border-t border-[var(--border)]/40 space-y-1">
        {discoveryLinks.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : undefined}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-full transition-all ${
                active
                  ? "active-nav-pill"
                  : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Explore More / Help */}
      <div className="pt-4 border-t border-[var(--border)]/40 space-y-1">
        <p className="px-4 text-[10px] font-bold text-[var(--default-muted)] uppercase tracking-wider mb-1">
          {t("explore_more", "EXPLORE MORE")}
        </p>
        <Link
          href="/contact-us"
          data-active={isCurrent("/contact-us") ? "true" : undefined}
          className={`relative flex items-center gap-3 px-4 py-2.5 rounded-full transition-all ${
            isCurrent("/contact-us")
              ? "active-nav-pill"
              : "text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{t("help", "Help")}</span>
        </Link>
      </div>

      {/* 4. Footer Links & Dynamic Copyright */}
      <div className="pt-4 border-t border-[var(--border)]/40 px-3 text-[11px] text-[var(--default-muted)] space-y-2">
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
        <p className="text-[10px] text-[var(--default-muted)] pt-2">
          {t("copyright", "Copyright © 2026 PlayTube. All rights reserved.")}
        </p>
      </div>
    </nav>
  );
}
