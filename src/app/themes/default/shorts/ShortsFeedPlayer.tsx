"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Check,
  Plus,
  Compass,
} from "lucide-react";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { toggleLikeVideoAction, toggleSubscribeAction } from "@/modules/videos/video.actions";

export interface ShortData {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  videoLocation: string;
  duration?: string | null;
  views?: number | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  initialVote?: 1 | 2 | null;
  isSubscribed?: boolean;
  user: {
    id: number;
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
}

interface ShortsFeedPlayerProps {
  shorts: ShortData[];
  initialIndex?: number;
}

export function ShortsFeedPlayer({ shorts, initialIndex = 0 }: ShortsFeedPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(
    shorts.length > 0 ? Math.min(Math.max(0, initialIndex), shorts.length - 1) : 0
  );

  // Playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Per-short interactive states cache
  const [voteState, setVoteState] = useState<Record<number, { vote: 1 | 2 | null; likes: number; dislikes: number }>>({});
  const [subState, setSubState] = useState<Record<number, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentShort = shorts[currentIndex];

  // Initialize or read current short's vote & sub state
  const currentVotes = currentShort
    ? voteState[currentShort.id] || {
      vote: currentShort.initialVote || null,
      likes: currentShort.likesCount || 0,
      dislikes: currentShort.dislikesCount || 0,
    }
    : { vote: null, likes: 0, dislikes: 0 };

  const isCurrentSubscribed = currentShort
    ? subState[currentShort.user.id] !== undefined
      ? subState[currentShort.user.id]
      : Boolean(currentShort.isSubscribed)
    : false;

  const goToNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, shorts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Keyboard Navigation: ArrowUp / ArrowDown / Spacebar / Mute (M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is focused on an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Mouse wheel scroll debounce navigation
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 550);
    }
  };

  // Touch Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartY.current = null;
  };

  // Auto-play when short changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // If browser policy blocks unmuted autoplay, mute and try again
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => { });
          }
        });
      }
    }
  }, [currentIndex]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Action: Toggle Like/Dislike
  const handleVote = async (type: 1 | 2) => {
    if (!currentShort) return;
    const prevVote = currentVotes.vote;
    const prevLikes = currentVotes.likes;
    const prevDislikes = currentVotes.dislikes;

    let nextVote: 1 | 2 | null = null;
    let nextLikes = prevLikes;
    let nextDislikes = prevDislikes;

    if (prevVote === type) {
      // Toggle off
      nextVote = null;
      if (type === 1) nextLikes = Math.max(0, nextLikes - 1);
      if (type === 2) nextDislikes = Math.max(0, nextDislikes - 1);
    } else {
      // Toggle on or switch
      nextVote = type;
      if (type === 1) {
        nextLikes = nextLikes + 1;
        if (prevVote === 2) nextDislikes = Math.max(0, nextDislikes - 1);
      } else {
        nextDislikes = nextDislikes + 1;
        if (prevVote === 1) nextLikes = Math.max(0, nextLikes - 1);
      }
    }

    setVoteState((prev) => ({
      ...prev,
      [currentShort.id]: {
        vote: nextVote,
        likes: nextLikes,
        dislikes: nextDislikes,
      },
    }));

    try {
      const res = await toggleLikeVideoAction({
        videoDbId: currentShort.id,
        type,
      });
      if (!res.success) {
        // Rollback
        setVoteState((prev) => ({
          ...prev,
          [currentShort.id]: { vote: prevVote, likes: prevLikes, dislikes: prevDislikes },
        }));
      }
    } catch {
      setVoteState((prev) => ({
        ...prev,
        [currentShort.id]: { vote: prevVote, likes: prevLikes, dislikes: prevDislikes },
      }));
    }
  };

  // Action: Toggle Subscribe
  const handleSubscribe = async () => {
    if (!currentShort) return;
    const nextSub = !isCurrentSubscribed;
    setSubState((prev) => ({
      ...prev,
      [currentShort.user.id]: nextSub,
    }));

    try {
      const res = await toggleSubscribeAction({
        channelUserId: currentShort.user.id,
      });
      if (!res.success) {
        setSubState((prev) => ({
          ...prev,
          [currentShort.user.id]: isCurrentSubscribed,
        }));
      }
    } catch {
      setSubState((prev) => ({
        ...prev,
        [currentShort.user.id]: isCurrentSubscribed,
      }));
    }
  };

  // Action: Share link
  const handleShare = () => {
    if (!currentShort) return;
    const url = `${window.location.origin}/watch/${currentShort.videoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!currentShort || shorts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--default-muted)] mb-4">
          <Compass className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-[var(--default-text)]">No Shorts Available</h3>
        <p className="text-xs text-[var(--default-muted)] mt-1 max-w-sm">
          There are currently no vertical short videos uploaded yet.
        </p>
        <Link
          href="/upload-video?type=shorts"
          className="mt-5 px-5 py-2 rounded-full bg-[var(--default-brand-red)] text-white text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
        >
          Create First Short
        </Link>
      </div>
    );
  }

  const avatarUrl = getPublicImageUrl(currentShort.user.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg";
  const displayName = currentShort.user.name || currentShort.user.username;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full flex items-center justify-center min-h-[calc(100vh-12rem)] py-2 select-none"
    >
      <div className="relative flex items-end gap-3 sm:gap-4 max-w-full">
        {/* 1. Main 9:16 Vertical Video Screen */}
        <div className="relative w-[340px] sm:w-[380px] md:w-[410px] h-[610px] sm:h-[680px] bg-black rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl flex items-center justify-center border-none group/player">
          {/* Video Player */}
          <video
            ref={videoRef}
            src={currentShort.videoLocation}
            poster={getPublicImageUrl(currentShort.thumbnail, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg"}
            loop
            playsInline
            muted={isMuted}
            autoPlay
            onClick={togglePlayPause}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Top Controls Overlay: Play/Pause indicator & Mute Button */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-all pointer-events-auto cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-all pointer-events-auto cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Play/Pause Splash Icon on Tap */}
          {!isPlaying && (
            <div
              onClick={togglePlayPause}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm shadow-xl">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Metadata Overlay */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none flex flex-col justify-end text-white">
            {/* Creator Row */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <Link href={`/@${currentShort.user.username}`} className="shrink-0 group/avatar">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-white/30 shadow-md group-hover/avatar:ring-2 group-hover/avatar:ring-white transition-all"
                />
              </Link>

              <div className="min-w-0 flex-1 flex items-center gap-2">
                <Link
                  href={`/@${currentShort.user.username}`}
                  className="text-sm font-semibold hover:underline truncate"
                >
                  @{currentShort.user.username}
                </Link>
                {currentShort.user.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </div>

              {/* YouTube-style Subscribe Button */}
              <button
                type="button"
                onClick={handleSubscribe}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${isCurrentSubscribed
                  ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs"
                  : "bg-white text-black hover:bg-white/90"
                  }`}
              >
                {isCurrentSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Video Title & Tags */}
            <div className="mt-2.5 pointer-events-auto">
              <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug drop-shadow-sm text-white/95">
                {currentShort.title}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Right-Hand Floating Action Bar (Like, Dislike, Comments, Share) */}
        <div className="flex flex-col items-center gap-4 sm:gap-5 pb-4">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => handleVote(1)}
              aria-label="Like short"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${currentVotes.vote === 1
                ? "bg-[var(--default-brand-red)] text-white"
                : "bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10"
                }`}
            >
              <ThumbsUp className={`w-5 h-5 ${currentVotes.vote === 1 ? "fill-white" : ""}`} />
            </button>
            <span className="text-[11px] font-semibold text-[var(--default-text)]">
              {currentVotes.likes > 0 ? currentVotes.likes.toLocaleString() : "Like"}
            </span>
          </div>

          {/* Dislike Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => handleVote(2)}
              aria-label="Dislike short"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${currentVotes.vote === 2
                ? "bg-neutral-700 text-white"
                : "bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10"
                }`}
            >
              <ThumbsDown className={`w-5 h-5 ${currentVotes.vote === 2 ? "fill-white" : ""}`} />
            </button>
            <span className="text-[11px] font-semibold text-[var(--default-text)]">
              Dislike
            </span>
          </div>

          {/* Comments Button (navigates to watch page with comments section) */}
          <div className="flex flex-col items-center gap-1">
            <Link
              href={`/watch/${currentShort.videoId}#comments`}
              aria-label="Open comments"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
            <span className="text-[11px] font-semibold text-[var(--default-text)]">
              {currentShort.commentsCount > 0 ? currentShort.commentsCount.toLocaleString() : "0"}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share short"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </button>
            <span className="text-[11px] font-semibold text-[var(--default-text)]">
              {copied ? "Copied" : "Share"}
            </span>
          </div>

          {/* Create Button */}
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/upload-video?type=shorts"
              aria-label="Create short"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] border border-black/5 dark:border-white/10 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </Link>
            <span className="text-[11px] font-semibold text-[var(--default-text)]">
              Create
            </span>
          </div>
        </div>

        {/* 3. Right-Side Up/Down Arrow Navigation Buttons (matches screenshot) */}
        <div className="hidden lg:flex flex-col gap-3 mb-24 ml-2">
          {/* Previous Short (Up Arrow) */}
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Previous short"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Next Short (Down Arrow) */}
          <button
            type="button"
            onClick={goToNext}
            disabled={currentIndex >= shorts.length - 1}
            aria-label="Next short"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#202020] text-[var(--default-text)] hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] border border-black/5 dark:border-white/10 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
