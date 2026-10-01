"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { addCommentAction } from "@/modules/videos/video.actions";
import { useTranslation } from "@/providers/language-provider";

interface CommentItem {
  id: number;
  text: string;
  user: {
    name: string | null;
    username: string;
    avatar: string | null;
    verified: boolean | null;
  };
}

interface VideoCommentsProps {
  videoId: number;
  initialComments?: CommentItem[];
}

export function VideoComments({ videoId, initialComments = [] }: VideoCommentsProps) {
  const { t } = useTranslation();
  const [commentList, setCommentList] = useState<CommentItem[]>(initialComments);
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addCommentAction({
      videoDbId: videoId,
      text: inputVal.trim(),
    });

    if (res.success) {
      setCommentList([
        {
          id: res.comment?.id || Date.now(),
          text: inputVal.trim(),
          user: {
            name: "Current User",
            username: "you",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
            verified: false,
          },
        },
        ...commentList,
      ]);
      setInputVal("");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--card-border)] shadow-xs space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          {t("comments", "Comments")} ({commentList.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={t("write_your_comment", "Write your comment..")}
          className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded-md px-4 py-2.5 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting || !inputVal.trim()}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white font-medium text-xs px-4 py-2.5 rounded-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t("publish", "Post")}</span>
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {commentList.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4 text-center">
            {t("no_comments_found", "No comments yet. Be the first to start the conversation!")}
          </p>
        ) : (
          commentList.map((c) => (
            <div key={c.id} className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.user.avatar ? (
                  <img
                    src={c.user.avatar}
                    alt={c.user.name || c.user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                    {c.user.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-200">
                  <span>@{c.user.username}</span>
                  {c.user.verified && (
                    <CheckCircle2 className="w-3 h-3 text-[var(--primary)]" />
                  )}
                  <span className="text-[10px] text-neutral-400 font-normal">Just now</span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {c.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
