"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Plus,
  MoreVertical,
  Flag,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/providers/language-provider";
import { reportVideoAction } from "@/modules/admin/reports.actions";
import { toggleWatchLaterAction } from "@/modules/videos/video.actions";

interface ShortActionRailProps {
  videoId: string;
  videoDbId: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  currentVote: 1 | 2 | null;
  commentsEnabled?: boolean;
  onVote: (type: 1 | 2) => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onRequireLogin: () => void;
  isLoggedIn?: boolean;
}

export function ShortActionRail({
  videoId,
  videoDbId,
  likesCount,
  dislikesCount,
  commentsCount,
  currentVote,
  commentsEnabled = true,
  onVote,
  onOpenComments,
  onOpenShare,
  onRequireLogin,
  isLoggedIn = false,
}: ShortActionRailProps) {
  const { t } = useTranslation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [watchLaterSuccess, setWatchLaterSuccess] = useState(false);

  // Format count (e.g. 1.2K)
  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const handleReport = async () => {
    setMoreMenuOpen(false);
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    try {
      const res = await reportVideoAction({
        videoId: videoDbId,
        text: "Inappropriate short content",
      });
      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 2500);
      }
    } catch {}
  };

  const handleWatchLater = async () => {
    setMoreMenuOpen(false);
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    try {
      const res = await toggleWatchLaterAction({ videoId: videoDbId });
      if (res.success) {
        setWatchLaterSuccess(true);
        setTimeout(() => setWatchLaterSuccess(false), 2500);
      }
    } catch {}
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 pb-4">
      {/* 1. Like Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onVote(1)}
          aria-label={t("like", "Like")}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            currentVote === 1
              ? "bg-[var(--default-brand-red)] text-white"
              : "bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10"
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${currentVote === 1 ? "fill-white" : ""}`} />
        </button>
        <span className="text-[11px] font-semibold text-[var(--default-text)]">
          {likesCount > 0 ? formatCount(likesCount) : t("like", "Like")}
        </span>
      </div>

      {/* 2. Dislike Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onVote(2)}
          aria-label={t("dislike", "Dislike")}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            currentVote === 2
              ? "bg-neutral-700 text-white"
              : "bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10"
          }`}
        >
          <ThumbsDown className={`w-5 h-5 ${currentVote === 2 ? "fill-white" : ""}`} />
        </button>
        <span className="text-[11px] font-semibold text-[var(--default-text)]">
          {dislikesCount > 0 ? formatCount(dislikesCount) : t("dislike", "Dislike")}
        </span>
      </div>

      {/* 3. Comments Button */}
      {commentsEnabled && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onOpenComments}
            aria-label={t("comments", "Comments")}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-semibold text-[var(--default-text)]">
            {commentsCount > 0 ? formatCount(commentsCount) : "0"}
          </span>
        </div>
      )}

      {/* 4. Share Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onOpenShare}
          aria-label={t("share", "Share")}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-semibold text-[var(--default-text)]">
          {t("share", "Share")}
        </span>
      </div>

      {/* 5. Create Button (Links to upload route, login required) */}
      <div className="flex flex-col items-center gap-1">
        <Link
          href={isLoggedIn ? "/upload-video?type=shorts" : `/login?next=${encodeURIComponent("/upload-video?type=shorts")}`}
          aria-label={t("create", "Create")}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </Link>
        <span className="text-[11px] font-semibold text-[var(--default-text)]">
          {t("create", "Create")}
        </span>
      </div>

      {/* 6. More Actions Menu (Report, Watch Later) */}
      <div className="relative flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          aria-label="More options"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {moreMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-[var(--default-panel)] border border-[var(--border)] rounded-2xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in">
            <button
              onClick={handleWatchLater}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--default-text)] text-left cursor-pointer transition-colors"
            >
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{watchLaterSuccess ? t("saved", "Saved!") : t("save_to_watch_later", "Save to Watch Later")}</span>
            </button>
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--default-text)] text-left cursor-pointer transition-colors"
            >
              <Flag className="w-4 h-4 text-red-500" />
              <span>{reportSuccess ? t("reported", "Reported!") : t("report", "Report")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
