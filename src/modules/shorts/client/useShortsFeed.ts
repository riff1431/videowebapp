"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ShortData } from "@/app/themes/default/shorts/ShortsFeedPlayer";
import { loadMoreShortsAction } from "@/modules/videos/video.actions";

export interface UseShortsFeedOptions {
  initialShorts: ShortData[];
  initialIndex?: number;
  initialVideoId?: string | null;
  pageSize?: number;
}

export function useShortsFeed({
  initialShorts,
  initialIndex = 0,
  initialVideoId,
  pageSize = 10,
}: UseShortsFeedOptions) {
  const [shorts, setShorts] = useState<ShortData[]>(initialShorts);
  
  // Resolve initial active index if a deep-linked videoId is provided
  const resolvedInitial = (() => {
    if (initialVideoId && initialShorts.length > 0) {
      const foundIdx = initialShorts.findIndex((s) => s.videoId === initialVideoId);
      if (foundIdx !== -1) return foundIdx;
    }
    return Math.min(Math.max(0, initialIndex), Math.max(0, initialShorts.length - 1));
  })();

  const [activeIndex, setActiveIndex] = useState<number>(resolvedInitial);
  const [hasMore, setHasMore] = useState<boolean>(initialShorts.length >= pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef<number>(initialShorts.length);

  // Load more shorts
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setError(null);

    try {
      const res = await loadMoreShortsAction({
        offset: offsetRef.current,
        limit: pageSize,
      });

      if (res.success && res.shorts) {
        setShorts((prev) => {
          // Filter duplicates by id
          const existingIds = new Set(prev.map((s) => s.id));
          const newItems = res.shorts.filter((s: ShortData) => !existingIds.has(s.id));
          return [...prev, ...newItems];
        });
        offsetRef.current += res.shorts.length;
        setHasMore(Boolean(res.hasMore));
      } else {
        setError(res.error || "Failed to load more shorts");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load more shorts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, pageSize]);

  // Navigate functions
  const goToNext = useCallback(() => {
    if (activeIndex < shorts.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, shorts.length]);

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < shorts.length) {
      setActiveIndex(index);
    }
  }, [shorts.length]);

  // Update deep link URL on active short change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = shorts[activeIndex];
    if (current?.videoId) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("v") !== current.videoId) {
        url.searchParams.set("v", current.videoId);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [activeIndex, shorts]);

  // Trigger load more when 3 items from the end
  useEffect(() => {
    if (shorts.length > 0 && activeIndex >= shorts.length - 3 && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [activeIndex, shorts.length, hasMore, isLoadingMore, loadMore]);

  return {
    shorts,
    setShorts,
    activeIndex,
    activeShort: shorts[activeIndex] || null,
    setActiveIndex: goToIndex,
    goToNext,
    goToPrev,
    hasMore,
    isLoadingMore,
    error,
    loadMore,
  };
}
