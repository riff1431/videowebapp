"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ShortData } from "@/app/themes/default/shorts/ShortsFeedPlayer";
import { ShortPlayer } from "./ShortPlayer";
import { ShortProgress } from "./ShortProgress";
import { ShortInfoOverlay } from "./ShortInfoOverlay";
import { ShortActionRail } from "./ShortActionRail";
import { useShortPlayback } from "@/modules/shorts/client/useShortPlayback";
import { useOptimisticReaction } from "@/modules/shorts/client/useOptimisticReaction";
import { getPublicImageUrl } from "@/lib/storage/image-url";

interface ShortItemProps {
  short: ShortData;
  isActive: boolean;
  isMounted: boolean;
  isLoggedIn?: boolean;
  currentUserId?: number | null;
  currentUserAvatar?: string | null;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onRequireLogin: () => void;
  isSheetOrDialogOpen?: boolean;
}

export function ShortItem({
  short,
  isActive,
  isMounted,
  isLoggedIn = false,
  currentUserId = null,
  currentUserAvatar = null,
  onOpenComments,
  onOpenShare,
  onRequireLogin,
  isSheetOrDialogOpen = false,
}: ShortItemProps) {
  // Headless Playback Hook
  const {
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    isBuffering,
    playbackError,
    showPlayPauseIndicator,
    togglePlay,
    toggleMute,
    seekTo,
    retryPlayback,
  } = useShortPlayback({
    videoId: short.videoId,
    isActive,
    isSheetOrDialogOpen,
  });

  // Headless Optimistic Reaction Hook
  const {
    vote,
    likes,
    dislikes,
    isSubscribed,
    handleVote,
    handleSubscribe,
  } = useOptimisticReaction({
    videoDbId: short.id,
    channelUserId: short.user.id,
    initialVote: short.initialVote,
    initialLikes: short.likesCount,
    initialDislikes: short.dislikesCount,
    initialSubscribed: short.isSubscribed,
    isLoggedIn,
    onRequireLogin,
  });

  const posterUrl = getPublicImageUrl(short.thumbnail, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg";

  return (
    <div
      className="relative flex items-end gap-3 sm:gap-4 max-w-full"
      role="listitem"
      aria-roledescription="short"
      aria-label={short.title}
    >
      {/* 1. Main 9:16 Vertical Video Screen */}
      <div className="relative w-[340px] sm:w-[380px] md:w-[410px] h-[610px] sm:h-[680px] bg-black rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl flex items-center justify-center border-none group/player">
        {isMounted ? (
          <ShortPlayer
            videoId={short.videoId}
            videoLocation={short.videoLocation}
            videoType={(short as any).videoType}
            youtubeUrl={(short as any).youtubeUrl}
            thumbnail={short.thumbnail}
            title={short.title}
            isActive={isActive}
            isMuted={isMuted}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            playbackError={playbackError}
            showPlayPauseIndicator={showPlayPauseIndicator}
            videoRef={videoRef}
            onTogglePlay={togglePlay}
            onRetry={retryPlayback}
          />
        ) : (
          /* Unmounted / Outside window: Display Poster Only */
          <div className="relative w-full h-full bg-black">
            <Image
              src={posterUrl}
              alt={short.title}
              fill
              sizes="(max-width: 768px) 100vw, 410px"
              className="object-cover"
            />
          </div>
        )}

        {/* Info Overlay (Creator, Title, Description, Subscribe) */}
        <ShortInfoOverlay
          user={short.user}
          title={short.title}
          description={(short as any).description}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
        />

        {/* Seekable Progress Bar */}
        <ShortProgress
          currentTime={currentTime}
          duration={duration}
          onSeek={seekTo}
        />
      </div>

      {/* 2. Right-Hand Floating Action Bar */}
      <div className="shrink-0">
        <ShortActionRail
          videoId={short.videoId}
          videoDbId={short.id}
          likesCount={likes}
          dislikesCount={dislikes}
          commentsCount={short.commentsCount}
          currentVote={vote}
          commentsEnabled={(short as any).commentsEnabled ?? true}
          onVote={handleVote}
          onOpenComments={onOpenComments}
          onOpenShare={onOpenShare}
          onRequireLogin={onRequireLogin}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
