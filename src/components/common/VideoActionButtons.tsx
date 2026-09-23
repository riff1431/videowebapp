"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Bell } from "lucide-react";
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubscribe}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
            isSubscribed
              ? "bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => handleVote(1)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              userVote === 1
                ? "text-red-600 bg-red-50 dark:bg-red-950/40"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{likes.toLocaleString()}</span>
          </button>
          <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700" />
          <button
            onClick={() => handleVote(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
              userVote === 2
                ? "text-red-600 bg-red-50 dark:bg-red-950/40"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            {dislikes > 0 && <span>{dislikes}</span>}
          </button>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
