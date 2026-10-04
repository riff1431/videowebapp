"use client";

import { useEffect, useCallback } from "react";

export interface UseShortsKeyboardOptions {
  enabled?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onLike?: () => void;
  onOpenComments?: () => void;
  onClosePanels?: () => void;
}

export function useShortsKeyboard({
  enabled = true,
  onNext,
  onPrev,
  onTogglePlay,
  onToggleMute,
  onLike,
  onOpenComments,
  onClosePanels,
}: UseShortsKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore when focused inside text inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
        case "J":
          e.preventDefault();
          onNext();
          break;

        case "ArrowUp":
        case "k":
        case "K":
          e.preventDefault();
          onPrev();
          break;

        case " ":
          e.preventDefault();
          onTogglePlay();
          break;

        case "m":
        case "M":
          e.preventDefault();
          onToggleMute();
          break;

        case "l":
        case "L":
          if (onLike) {
            e.preventDefault();
            onLike();
          }
          break;

        case "c":
        case "C":
          if (onOpenComments) {
            e.preventDefault();
            onOpenComments();
          }
          break;

        case "Escape":
          if (onClosePanels) {
            e.preventDefault();
            onClosePanels();
          }
          break;

        default:
          break;
      }
    },
    [
      enabled,
      onNext,
      onPrev,
      onTogglePlay,
      onToggleMute,
      onLike,
      onOpenComments,
      onClosePanels,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
