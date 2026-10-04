"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, ThumbsUp, Trash2, X, AlertCircle } from "lucide-react";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { Button } from "@/app/themes/default/components/ui/button";
import {
  addCommentAction,
  loadMoreCommentsAction,
  deleteCommentAction,
} from "@/modules/videos/video.actions";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { useTranslation } from "@/providers/language-provider";

interface CommentItem {
  id: number;
  text: string;
  createdAt: Date | string;
  user: {
    id?: number;
    name: string | null;
    username: string;
    avatar: string | null;
    verified: boolean | null;
  };
}

interface ShortCommentsPanelProps {
  videoId: string;
  videoDbId: number;
  commentsCount: number;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  currentUserId?: number | null;
  currentUserAvatar?: string | null;
  commentsEnabled?: boolean;
}

export function ShortCommentsPanel({
  videoId,
  videoDbId,
  commentsCount: initialCount,
  isOpen,
  onClose,
  isLoggedIn = false,
  currentUserId = null,
  currentUserAvatar = null,
  commentsEnabled = true,
}: ShortCommentsPanelProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Fetch comments when panel opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    loadMoreCommentsAction({
      videoId: videoDbId,
      offset: 0,
      limit: 15,
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.comments) {
          setComments(res.comments as CommentItem[]);
          setHasMore(Boolean(res.hasMore));
          setOffset(res.comments.length);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, videoDbId]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await loadMoreCommentsAction({
        videoId: videoDbId,
        offset,
        limit: 15,
      });
      if (res.success && res.comments) {
        setComments((prev) => [...prev, ...(res.comments as CommentItem[])]);
        setHasMore(Boolean(res.hasMore));
        setOffset((prev) => prev + res.comments.length);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await addCommentAction({
        videoDbId,
        text: commentText.trim(),
      });
      if (res.success && res.comment) {
        const newC: CommentItem = {
          id: res.comment.id,
          text: res.comment.text,
          createdAt: new Date(),
          user: {
            id: currentUserId || undefined,
            name: "You",
            username: "you",
            avatar: currentUserAvatar || "/upload/photos/d-avatar.jpg",
            verified: false,
          },
        };
        setComments((prev) => [newC, ...prev]);
        setTotalCount((prev) => prev + 1);
        setCommentText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const res = await deleteCommentAction(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Desktop Side Panel (>= 1024px) */}
      <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] h-[680px] bg-[var(--default-panel)] border border-[var(--border)] rounded-[28px] shadow-2xl overflow-hidden z-30 animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/40 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[var(--default-text)]">
              {t("comments", "Comments")}
            </h3>
            <span className="text-xs text-[var(--default-muted)] font-semibold">
              {totalCount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--default-muted)] hover:text-[var(--default-text)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!commentsEnabled ? (
            <div className="text-center py-12 text-xs text-[var(--default-muted)]">
              {t("comments_disabled", "Comments are turned off for this short.")}
            </div>
          ) : comments.length === 0 && !isLoading ? (
            <div className="text-center py-12 text-xs text-[var(--default-muted)]">
              {t("no_comments_yet", "No comments yet. Be the first to comment!")}
            </div>
          ) : (
            comments.map((c) => {
              const avatar = getPublicImageUrl(c.user.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg";
              return (
                <div key={c.id} className="flex items-start gap-3 text-xs group/item">
                  <Link href={`/@${c.user.username}`} className="shrink-0">
                    <Avatar src={avatar} alt={c.user.username} size="sm" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Link
                        href={`/@${c.user.username}`}
                        className="font-semibold text-[var(--default-text)] hover:underline truncate"
                      >
                        @{c.user.username}
                      </Link>
                    </div>
                    <p className="text-[var(--default-text)] leading-relaxed break-words">
                      {c.text}
                    </p>
                  </div>
                  {currentUserId && c.user.id === currentUserId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete comment"
                      className="opacity-0 group-hover/item:opacity-100 p-1 text-[var(--default-muted)] hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}

          {hasMore && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? t("loading", "Loading...") : t("load_more", "Load more")}
              </Button>
            </div>
          )}
        </div>

        {/* Composer */}
        {commentsEnabled && (
          <div className="p-3 border-t border-[var(--border)]/40 bg-[var(--default-canvas)]/50 shrink-0">
            {isLoggedIn ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Avatar
                  src={getPublicImageUrl(currentUserAvatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
                  alt="You"
                  size="sm"
                />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t("add_a_comment", "Add a comment...")}
                  className="flex-1 px-3 py-2 rounded-full bg-[var(--default-search-bg)] border border-[var(--default-search-border)] text-xs text-[var(--default-text)] placeholder:text-[var(--default-muted)] outline-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="pill-active"
                  disabled={!commentText.trim() || isSubmitting}
                  className="rounded-full w-8 h-8 p-0 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            ) : (
              <div className="text-center py-2 text-xs text-[var(--default-muted)]">
                <Link
                  href={`/login?next=${encodeURIComponent(`/shorts?v=${videoId}`)}`}
                  className="text-[var(--default-brand-red)] font-semibold hover:underline"
                >
                  {t("login_to_comment", "Log in to comment")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Mobile Bottom Sheet / Drawer (< 1024px) */}
      <div
        className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg h-[75vh] bg-[var(--default-panel)] border-t border-[var(--border)] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle & Header */}
          <div className="flex flex-col items-center pt-2 pb-3 px-5 border-b border-[var(--border)]/40 shrink-0">
            <div className="w-12 h-1 rounded-full bg-[var(--border)] mb-3" />
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[var(--default-text)]">
                  {t("comments", "Comments")}
                </h3>
                <span className="text-xs text-[var(--default-muted)] font-semibold">
                  {totalCount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close comments"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--default-muted)] hover:text-[var(--default-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!commentsEnabled ? (
              <div className="text-center py-12 text-xs text-[var(--default-muted)]">
                {t("comments_disabled", "Comments are turned off for this short.")}
              </div>
            ) : comments.length === 0 && !isLoading ? (
              <div className="text-center py-12 text-xs text-[var(--default-muted)]">
                {t("no_comments_yet", "No comments yet. Be the first to comment!")}
              </div>
            ) : (
              comments.map((c) => {
                const avatar = getPublicImageUrl(c.user.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg";
                return (
                  <div key={c.id} className="flex items-start gap-3 text-xs">
                    <Link href={`/@${c.user.username}`} className="shrink-0">
                      <Avatar src={avatar} alt={c.user.username} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Link
                          href={`/@${c.user.username}`}
                          className="font-semibold text-[var(--default-text)] hover:underline truncate"
                        >
                          @{c.user.username}
                        </Link>
                      </div>
                      <p className="text-[var(--default-text)] leading-relaxed break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {hasMore && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? t("loading", "Loading...") : t("load_more", "Load more")}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Composer */}
          {commentsEnabled && (
            <div className="p-3 border-t border-[var(--border)]/40 bg-[var(--default-canvas)]/50 shrink-0 pb-safe">
              {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t("add_a_comment", "Add a comment...")}
                    className="flex-1 px-3 py-2 rounded-full bg-[var(--default-search-bg)] border border-[var(--default-search-border)] text-xs text-[var(--default-text)] outline-none"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="pill-active"
                    disabled={!commentText.trim() || isSubmitting}
                    className="rounded-full w-8 h-8 p-0 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              ) : (
                <div className="text-center py-2 text-xs text-[var(--default-muted)]">
                  <Link
                    href={`/login?next=${encodeURIComponent(`/shorts?v=${videoId}`)}`}
                    className="text-[var(--default-brand-red)] font-semibold hover:underline"
                  >
                    {t("login_to_comment", "Log in to comment")}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
