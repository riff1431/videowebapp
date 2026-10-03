"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, CornerDownRight, Loader2 } from "lucide-react";
import { addCommentAction, addCommentReplyAction, loadMoreCommentsAction } from "@/modules/videos/video.actions";
import { useTranslation } from "@/providers/language-provider";
import { getPublicImageUrl } from "@/lib/storage/image-url";

interface ReplyItem {
  id: number;
  text: string;
  user?: {
    name: string | null;
    username: string;
    avatar: string | null;
    verified: boolean | null;
  };
}

interface CommentItem {
  id: number;
  text: string;
  createdAt?: Date | string;
  user: {
    name: string | null;
    username: string;
    avatar: string | null;
    verified: boolean | null;
  };
  replies?: ReplyItem[];
}

interface VideoCommentsProps {
  videoId: number;
  initialComments?: CommentItem[];
  defaultPageSize?: number;
  totalCommentsCount?: number;
}

export function VideoComments({
  videoId,
  initialComments = [],
  defaultPageSize = 20,
  totalCommentsCount = 0,
}: VideoCommentsProps) {
  const { t } = useTranslation();
  const [commentList, setCommentList] = useState<CommentItem[]>(initialComments);
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replies state
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInputVal, setReplyInputVal] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Pagination / Load More state
  const [offset, setOffset] = useState(initialComments.length);
  const [hasMore, setHasMore] = useState(
    totalCommentsCount > initialComments.length || initialComments.length >= defaultPageSize
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputVal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addCommentAction({
      videoDbId: videoId,
      text: inputVal.trim(),
    });

    if (res.success && res.comment) {
      setCommentList([
        {
          id: res.comment.id,
          text: res.comment.text,
          user: {
            name: "Current User",
            username: "you",
            avatar: "/upload/photos/d-avatar.jpg",
            verified: false,
          },
          replies: [],
        },
        ...commentList,
      ]);
      setInputVal("");
      setOffset((prev) => prev + 1);
    }
    setIsSubmitting(false);
  }

  async function handleReplySubmit(commentId: number, e: React.FormEvent) {
    e.preventDefault();
    if (!replyInputVal.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    const res = await addCommentReplyAction({
      commentId,
      videoDbId: videoId,
      text: replyInputVal.trim(),
    });

    if (res.success && res.reply) {
      setCommentList((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: res.reply!.id,
                  text: res.reply!.text,
                  user: {
                    name: "Current User",
                    username: "you",
                    avatar: "/upload/photos/d-avatar.jpg",
                    verified: false,
                  },
                },
              ],
            };
          }
          return c;
        })
      );
      setReplyInputVal("");
      setActiveReplyId(null);
    }
    setIsSubmittingReply(false);
  }

  async function handleLoadMore() {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    const res = await loadMoreCommentsAction({
      videoId,
      offset,
      limit: defaultPageSize,
    });

    if (res.success && res.comments) {
      const newItems = res.comments as CommentItem[];
      setCommentList((prev) => [...prev, ...newItems]);
      setOffset((prev) => prev + newItems.length);
      setHasMore(res.hasMore ?? false);
    } else {
      setHasMore(false);
    }
    setIsLoadingMore(false);
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--card-border)] shadow-xs space-y-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          {t("comments", "Comments")} ({Math.max(commentList.length, totalCommentsCount)})
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
            <div key={c.id} className="space-y-2 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.user.avatar ? (
                    <img
                      src={getPublicImageUrl(c.user.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
                      alt={c.user.name || c.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500">
                      {c.user.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-200">
                    <span>@{c.user.username}</span>
                    {c.user.verified && (
                      <CheckCircle2 className="w-3 h-3 text-[var(--primary)]" />
                    )}
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {c.text}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors cursor-pointer"
                    >
                      {activeReplyId === c.id ? t("cancel", "Cancel") : t("reply", "Reply")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {activeReplyId === c.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(c.id, e)}
                  className="ml-11 flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={replyInputVal}
                    onChange={(e) => setReplyInputVal(e.target.value)}
                    placeholder={t("reply_placeholder", "Write a reply...")}
                    className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-[var(--border)] rounded px-3 py-1.5 focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyInputVal.trim()}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white font-medium text-xs px-3 py-1.5 rounded transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    {isSubmittingReply ? "..." : t("reply", "Reply")}
                  </button>
                </form>
              )}

              {/* Nested Replies List */}
              {c.replies && c.replies.length > 0 && (
                <div className="ml-11 space-y-2 pt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-3">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-1" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-200">
                          <span>@{r.user?.username || "you"}</span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {r.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center justify-center gap-1.5 mx-auto py-2 px-4 rounded border border-[var(--border)] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoadingMore ? t("loading", "Loading...") : t("load_more", "Load more comments")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
