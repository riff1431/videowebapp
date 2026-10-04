"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Compass, Plus } from "lucide-react";
import { ShortData } from "@/app/themes/default/shorts/ShortsFeedPlayer";
import { ShortItem } from "./ShortItem";
import { ShortShareDialog } from "./ShortShareDialog";
import { ShortsShortcutsHelp } from "./ShortsShortcutsHelp";
import { ShortsSkeleton, ShortsEmpty, ShortsError } from "./ShortsSkeleton";
import { useShortsFeed } from "@/modules/shorts/client/useShortsFeed";
import { useShortsKeyboard } from "@/modules/shorts/client/useShortsKeyboard";
import { useTranslation } from "@/providers/language-provider";
import { getPublicImageUrl } from "@/lib/storage/image-url";

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
    onTogglePlay: () => { },
    onToggleMute: () => { },
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
  const bgPosterUrl = current?.thumbnail
    ? getPublicImageUrl(current.thumbnail, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg"
    : "/upload/photos/d-cover.jpg";

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full flex-1 h-full max-h-full flex items-center justify-center min-h-0 py-0 select-none relative overflow-hidden"
      aria-label="Shorts Feed"
    >
      {/* Desktop Blurred Background Video/Poster (matches screenshot reference, hidden on mobile) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block z-0" aria-hidden="true">
        {current?.videoLocation && !(current as any)?.youtubeUrl && !current?.videoLocation.includes("youtube.com") ? (
          <video
            key={current.videoLocation}
            src={current.videoLocation}
            poster={bgPosterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110 blur-2xl opacity-40 brightness-75 transition-opacity duration-700"
          />
        ) : (
          <Image
            key={bgPosterUrl}
            src={bgPosterUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-2xl opacity-40 brightness-75 transition-opacity duration-700"
          />
        )}
        {/* Soft vignette overlay so center player pops */}
        {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-md" /> */}
      </div>

      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {current?.title ? `Now playing: ${current.title}` : ""}
      </div>

      {/* Desktop Top-Right Floating "+ Create" Button (visible on md+) */}
      <div className="absolute top-2 right-2 sm:right-4 z-20 hidden md:block">
        <Link
          href={isLoggedIn ? "/upload-video?type=shorts" : `/login?next=${encodeURIComponent("/upload-video?type=shorts")}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0088cc]/90 hover:bg-[#0088cc] text-white text-xs font-semibold shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t("create", "Create")}</span>
        </Link>
      </div>

      <div className="relative flex items-center justify-center gap-3 sm:gap-4 w-full max-w-full h-full max-h-full z-10 py-0">
        {/* Render current active short with windowing (previous, current, next) */}
        {current && (
          <ShortItem
            key={current.feedKey || `${current.id}-${activeIndex}`}
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

        {/* Right-Side Desktop Up/Down Navigation Chevrons matching screenshot design */}
        <div className="hidden lg:flex flex-col gap-3 ml-2 mr-2 shrink-0 self-center">
          <button
            type="button"
            onClick={goToPrev}
            disabled={activeIndex === 0}
            aria-label="Previous short"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0088cc]/90 text-white hover:bg-[#0088cc] shadow-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={shorts.length === 0}
            aria-label="Next short"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0088cc]/90 text-white hover:bg-[#0088cc] shadow-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
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
