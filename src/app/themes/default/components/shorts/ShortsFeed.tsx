"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Compass } from "lucide-react";
import { ShortData } from "@/app/themes/default/shorts/ShortsFeedPlayer";
import { ShortItem } from "./ShortItem";
import { ShortShareDialog } from "./ShortShareDialog";
import { ShortsShortcutsHelp } from "./ShortsShortcutsHelp";
import { ShortsSkeleton, ShortsEmpty, ShortsError } from "./ShortsSkeleton";
import { useShortsFeed } from "@/modules/shorts/client/useShortsFeed";
import { useShortsKeyboard } from "@/modules/shorts/client/useShortsKeyboard";
import { useTranslation } from "@/providers/language-provider";

// Lazy-load comments panel with dynamic import
const ShortCommentsPanel = dynamic(
  () => import("./ShortCommentsPanel").then((mod) => mod.ShortCommentsPanel),
  { ssr: false }
);

interface ShortsFeedProps {
  initialShorts: ShortData[];
  initialIndex?: number;
  initialVideoId?: string | null;
  user?: {
    id: number;
    username: string;
    avatar?: string | null;
  } | null;
}

export function ShortsFeed({
  initialShorts,
  initialIndex = 0,
  initialVideoId = null,
  user = null,
}: ShortsFeedProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // Feed Hook
  const {
    shorts,
    activeIndex,
    activeShort,
    setActiveIndex,
    goToNext,
    goToPrev,
    hasMore,
    isLoadingMore,
    error,
    loadMore,
  } = useShortsFeed({
    initialShorts,
    initialIndex,
    initialVideoId,
    pageSize: 10,
  });

  const isLoggedIn = Boolean(user?.id);

  // Debounced wheel navigation (1 gesture = 1 short)
  const wheelLockRef = useRef<boolean>(false);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLockRef.current) return;
      if (Math.abs(e.deltaY) > 30) {
        wheelLockRef.current = true;
        if (e.deltaY > 0) {
          goToNext();
        } else {
          goToPrev();
        }
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 400);
      }
    },
    [goToNext, goToPrev]
  );

  // Touch swipe navigation
  const touchStartRef = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartRef.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  // Keyboard navigation
  useShortsKeyboard({
    enabled: true,
    onNext: goToNext,
    onPrev: goToPrev,
    onTogglePlay: () => {},
    onToggleMute: () => {},
    onOpenComments: () => setCommentsOpen((prev) => !prev),
    onClosePanels: () => {
      setCommentsOpen(false);
      setShareOpen(false);
      setHelpOpen(false);
      setLoginPromptOpen(false);
    },
  });

  // Login prompt handler
  const handleRequireLogin = () => {
    setLoginPromptOpen(true);
  };

  if (!shorts || shorts.length === 0) {
    return <ShortsEmpty />;
  }

  const current = shorts[activeIndex] || shorts[0];

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full flex items-center justify-center min-h-[calc(100vh-12rem)] py-2 select-none relative"
      aria-label="Shorts Feed"
    >
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {current?.title ? `Now playing: ${current.title}` : ""}
      </div>

      <div className="relative flex items-end gap-3 sm:gap-4 max-w-full">
        {/* Render current active short with windowing (previous, current, next) */}
        {current && (
          <ShortItem
            key={current.id}
            short={current}
            isActive={true}
            isMounted={true}
            isLoggedIn={isLoggedIn}
            currentUserId={user?.id}
            currentUserAvatar={user?.avatar}
            onOpenComments={() => setCommentsOpen(!commentsOpen)}
            onOpenShare={() => setShareOpen(true)}
            onRequireLogin={handleRequireLogin}
            isSheetOrDialogOpen={commentsOpen || shareOpen || helpOpen || loginPromptOpen}
          />
        )}

        {/* Desktop Side Comments Panel (>= 1024px) */}
        {current && (
          <ShortCommentsPanel
            videoId={current.videoId}
            videoDbId={current.id}
            commentsCount={current.commentsCount}
            isOpen={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            isLoggedIn={isLoggedIn}
            currentUserId={user?.id}
            currentUserAvatar={user?.avatar}
            commentsEnabled={(current as any).commentsEnabled ?? true}
          />
        )}

        {/* Right-Side Desktop Up/Down Navigation Chevrons */}
        <div className="hidden lg:flex flex-col gap-3 mb-24 ml-2">
          <button
            type="button"
            onClick={goToPrev}
            disabled={activeIndex === 0}
            aria-label="Previous short"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={activeIndex === shorts.length - 1 && !hasMore}
            aria-label="Next short"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Share Dialog */}
      {current && (
        <ShortShareDialog
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          videoId={current.videoId}
          title={current.title}
        />
      )}

      {/* Shortcuts Help Modal */}
      <ShortsShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Login Prompt Dialog */}
      {loginPromptOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Login Required"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLoginPromptOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[var(--default-panel)] border border-[var(--border)] p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--default-text)]">
              {t("sign_in_required", "Sign in to continue")}
            </h3>
            <p className="text-xs text-[var(--default-muted)]">
              {t("sign_in_prompt_desc", "Sign in to like, dislike, comment, or subscribe to channels.")}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLoginPromptOpen(false)}
                className="px-4 py-2 rounded-full border border-[var(--border)] text-xs font-semibold text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  const returnUrl = `/shorts?v=${current?.videoId || ""}`;
                  router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
                }}
                className="px-5 py-2 rounded-full bg-[var(--default-brand-red)] text-white text-xs font-semibold hover:opacity-90"
              >
                {t("sign_in", "Sign in")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
