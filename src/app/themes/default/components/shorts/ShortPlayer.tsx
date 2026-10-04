"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Play, AlertCircle, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { Button } from "@/app/themes/default/components/ui/button";

interface ShortPlayerProps {
  videoId: string;
  videoLocation: string;
  videoType?: string | null;
  youtubeUrl?: string | null;
  thumbnail: string;
  title: string;
  isActive: boolean;
  isMuted: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  showPlayPauseIndicator: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTogglePlay: () => void;
  onRetry: () => void;
}

export function ShortPlayer({
  videoId,
  videoLocation,
  videoType,
  youtubeUrl,
  thumbnail,
  title,
  isActive,
  isMuted,
  isPlaying,
  isBuffering,
  playbackError,
  showPlayPauseIndicator,
  videoRef,
  onTogglePlay,
  onRetry,
}: ShortPlayerProps) {
  const posterUrl = getPublicImageUrl(thumbnail, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg";

  // Check if provider embed
  const isYouTubeEmbed = Boolean(youtubeUrl || (videoLocation && videoLocation.includes("youtube.com")));
  const isVimeoEmbed = Boolean(videoLocation && videoLocation.includes("vimeo.com"));
  const isDailymotionEmbed = Boolean(videoLocation && videoLocation.includes("dailymotion.com"));

  // Check data-saver
  const isSaveData = typeof navigator !== "undefined" && (navigator as any).connection?.saveData;

  if (playbackError) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-6 text-center text-white">
        <AlertCircle className="w-12 h-12 text-[var(--default-brand-red)] mb-3" />
        <p className="text-sm font-semibold mb-2">{playbackError}</p>
        <Button variant="pill-active" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  // If YouTube embed provider
  if (isYouTubeEmbed) {
    const embedId = (() => {
      const target = youtubeUrl || videoLocation;
      const match = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      return match ? match[1] : null;
    })();

    if (embedId) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=${isActive ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${embedId}&controls=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full object-cover pointer-events-auto border-none"
          />
        </div>
      );
    }
  }

  // If Vimeo / Dailymotion fallback
  if (isVimeoEmbed || isDailymotionEmbed) {
    return (
      <div className="relative w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center text-white">
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 410px"
          className="object-cover opacity-40 blur-xs"
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <p className="text-xs font-semibold">{title}</p>
          <a
            href={`/watch/${videoId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--default-brand-red)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>Watch on watch page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Native HTML5 Video
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={videoLocation}
        poster={posterUrl}
        preload={isSaveData ? "none" : isActive ? "auto" : "metadata"}
        loop
        playsInline
        muted={isMuted}
        onClick={onTogglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Brief centered indicator that fades out on tap */}
      {showPlayPauseIndicator && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs shadow-xl animate-out fade-out zoom-out-90 duration-500">
            {isPlaying ? <Play className="w-7 h-7 fill-white ml-1" /> : <div className="w-4 h-6 flex gap-1.5"><div className="w-1.5 h-full bg-white rounded-full"/><div className="w-1.5 h-full bg-white rounded-full"/></div>}
          </div>
        </div>
      )}
    </div>
  );
}
