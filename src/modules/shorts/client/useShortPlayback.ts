"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { recordShortViewAction } from "@/modules/videos/video.actions";

export interface UseShortPlaybackOptions {
  videoId: string;
  isActive: boolean;
  isSheetOrDialogOpen?: boolean;
}

export function useShortPlayback({
  videoId,
  isActive,
  isSheetOrDialogOpen = false,
}: UseShortPlaybackOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState<boolean>(false);

  const viewCountedRef = useRef<boolean>(false);
  const playTimeAccRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Read saved mute and volume preference from localStorage
  useEffect(() => {
    try {
      const savedMute = localStorage.getItem("shorts_muted");
      if (savedMute !== null) {
        setIsMuted(savedMute === "true");
      }
      const savedVol = localStorage.getItem("shorts_volume");
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          setVolume(v);
        }
      }
    } catch {
      // LocalStorage access may fail in restricted/iframe environments
    }
  }, []);

  // Sync mute to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Handle Playback active/inactive states
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isSheetOrDialogOpen && !document.hidden) {
      if (isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== "AbortError") {
              // Browser may block unmuted autoplay, fallback to muted
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            }
          });
        }
      }
    } else {
      video.pause();
    }
  }, [isActive, isPlaying, isSheetOrDialogOpen]);

  // Pause when document is hidden (switching tabs)
  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
      } else if (isActive && isPlaying && !isSheetOrDialogOpen) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isActive, isPlaying, isSheetOrDialogOpen]);

  // View count logic: 2 seconds of actual playback (or 50% for shorts under 4 seconds)
  useEffect(() => {
    if (!isActive) {
      // Reset accumulator when leaving short
      playTimeAccRef.current = 0;
      lastTimeRef.current = 0;
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      if (!viewCountedRef.current && !video.paused) {
        const now = video.currentTime;
        const diff = Math.max(0, now - lastTimeRef.current);
        if (diff > 0 && diff < 1) {
          playTimeAccRef.current += diff;
        }
        lastTimeRef.current = now;

        const dur = video.duration || duration;
        const threshold = dur > 0 && dur < 4 ? dur * 0.5 : 2;

        if (playTimeAccRef.current >= threshold) {
          viewCountedRef.current = true;
          recordShortViewAction(videoId).catch(() => {});
        }
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsBuffering(false);
    };
    const onError = () => {
      setIsBuffering(false);
      setPlaybackError("Failed to play video");
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };
  }, [isActive, videoId, duration]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setShowPlayPauseIndicator(true);
    setTimeout(() => setShowPlayPauseIndicator(false), 600);

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle Mute & persist
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("shorts_muted", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Seek
  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  return {
    videoRef,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isBuffering,
    playbackError,
    showPlayPauseIndicator,
    togglePlay,
    toggleMute,
    seekTo,
    retryPlayback: () => {
      setPlaybackError(null);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    },
  };
}
