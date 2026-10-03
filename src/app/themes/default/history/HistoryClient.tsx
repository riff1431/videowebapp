"use client";

import React, { useState } from "react";
import { VideoCard } from "@/components/common/VideoCard";
import { clearWatchHistoryAction, removeVideoFromHistoryAction } from "@/modules/videos/history.actions";
import { History as HistoryIcon, VideoOff, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface HistoryVideoItem {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string | null;
  duration?: string | null;
  views?: number | null;
  createdAt: Date;
  user: {
    username: string;
    name: string | null;
    avatar: string | null;
    verified: boolean | null;
  };
}

interface HistoryClientProps {
  initialVideos: HistoryVideoItem[];
}

export function HistoryClient({ initialVideos }: HistoryClientProps) {
  const [videoList, setVideoList] = useState<HistoryVideoItem[]>(initialVideos);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const router = useRouter();

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showClearModal && !isClearing) {
        setShowClearModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showClearModal, isClearing]);

  const handleConfirmClear = async () => {
    setIsClearing(true);
    setErrorMsg("");
    try {
      const res = await clearWatchHistoryAction();
      if (res.success) {
        setVideoList([]);
        setShowClearModal(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to clear history.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while clearing history.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveSingle = async (videoId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRemovingId(videoId);
    try {
      const res = await removeVideoFromHistoryAction(videoId);
      if (res.success) {
        setVideoList((prev) => prev.filter((v) => v.id !== videoId));
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to remove video from history:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle Icon & Clear History button */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <HistoryIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            History
          </h1>
        </div>

        {videoList.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setShowClearModal(true);
            }}
            disabled={isClearing}
            className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 transition-colors bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 px-3.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Empty State matching PlayTube Reference Screenshot */}
      {videoList.length === 0 ? (
        <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No videos found, watch to get started!
          </p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {videoList.map((v) => (
            <div key={v.id} className="relative group">
              <VideoCard
                videoId={v.videoId}
                title={v.title}
                thumbnail={v.thumbnail || undefined}
                duration={v.duration}
                views={v.views}
                createdAt={v.createdAt}
                user={v.user}
              />
              {/* Optional individual delete button on hover */}
              <button
                type="button"
                onClick={(e) => handleRemoveSingle(v.id, e)}
                disabled={removingId === v.id}
                title="Remove from history"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md z-10"
              >
                {removingId === v.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Clearing History */}
      {showClearModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => !isClearing && setShowClearModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => !isClearing && setShowClearModal(false)}
              disabled={isClearing}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Clear watch history?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to clear your entire watch history? All watched video records will be permanently removed from your account.
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
