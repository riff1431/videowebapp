"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Bell, Check } from "lucide-react";
import { toggleLikeVideoAction, toggleSubscribeAction } from "@/modules/videos/video.actions";

interface VideoActionButtonsProps {
  videoDbId: number;
  channelUserId: number;
  initialLikes?: number;
  initialDislikes?: number;
}

export function VideoActionButtons({
  videoDbId,
  channelUserId,
  initialLikes = 0,
  initialDislikes = 0,
}: VideoActionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<1 | 2 | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleVote(type: 1 | 2) {
    if (userVote === type) {
      setUserVote(null);
      if (type === 1) setLikes((l) => Math.max(0, l - 1));
      else setDislikes((d) => Math.max(0, d - 1));
    } else {
      if (type === 1) {
        setLikes((l) => l + 1);
        if (userVote === 2) setDislikes((d) => Math.max(0, d - 1));
      } else {
        setDislikes((d) => d + 1);
        if (userVote === 1) setLikes((l) => Math.max(0, l - 1));
      }
      setUserVote(type);
    }

    await toggleLikeVideoAction({ videoDbId, type });
  }

  async function handleSubscribe() {
    setIsSubscribed(!isSubscribed);
    await toggleSubscribeAction({ channelUserId });
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
      {/* Subscribe Button - PlayTube Cyan Styling */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubscribe}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-xs ${
            isSubscribed
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
              : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Like / Dislike Pills */}
        <div className="flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => handleVote(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              userVote === 1
                ? "text-[var(--primary)] bg-sky-50 dark:bg-sky-950/40"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likes.toLocaleString()}</span>
          </button>
          <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700" />
          <button
            onClick={() => handleVote(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              userVote === 2
                ? "text-red-500 bg-red-50 dark:bg-red-950/40"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            {dislikes > 0 && <span>{dislikes}</span>}
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Share"}</span>
        </button>

        {/* Save / Watch Later Button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-xs font-semibold transition-colors cursor-pointer ${
            isSaved
              ? "bg-sky-50 text-[var(--primary)] border-[var(--primary)]"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
