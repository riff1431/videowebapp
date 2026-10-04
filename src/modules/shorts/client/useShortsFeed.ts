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

  // Shuffle helper (Fisher-Yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const cycleCountRef = useRef<number>(1);
  const basePoolRef = useRef<ShortData[]>(initialShorts);

  // Keep base pool in sync
  useEffect(() => {
    if (initialShorts.length > 0 && basePoolRef.current.length === 0) {
      basePoolRef.current = initialShorts;
    }
  }, [initialShorts]);

  // Load more shorts or loop existing pool if server ends
  const loadMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);

    try {
      if (hasMore) {
        const res = await loadMoreShortsAction({
          offset: offsetRef.current,
          limit: pageSize,
        });

        if (res.success && res.shorts && res.shorts.length > 0) {
          const newItems = res.shorts.map((s: ShortData) => ({
            ...s,
            feedKey: `${s.id}-${s.videoId}`,
          }));

          setShorts((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const freshItems = newItems.filter((s: ShortData) => !existingIds.has(s.id));
            const updated = [...prev, ...freshItems];
            basePoolRef.current = updated;
            return updated;
          });

          offsetRef.current += res.shorts.length;
          setHasMore(Boolean(res.hasMore));
          return;
        } else {
          setHasMore(false);
        }
      }

      // If server has no more unseen shorts or hasMore is false,
      // seamlessly loop and shuffle the base pool so the feed is truly infinite
      if (basePoolRef.current.length > 0) {
        cycleCountRef.current += 1;
        const currentCycle = cycleCountRef.current;
        const shuffled = shuffleArray(basePoolRef.current).map((s) => ({
          ...s,
          feedKey: `${s.id}-cycle-${currentCycle}-${Math.random().toString(36).substring(2, 6)}`,
        }));

        setShorts((prev) => [...prev, ...shuffled]);
      }
    } catch (err: any) {
      // Fallback to pool shuffle on error to prevent feed disruption
      if (basePoolRef.current.length > 0) {
        cycleCountRef.current += 1;
        const currentCycle = cycleCountRef.current;
        const shuffled = shuffleArray(basePoolRef.current).map((s) => ({
          ...s,
          feedKey: `${s.id}-cycle-${currentCycle}-${Math.random().toString(36).substring(2, 6)}`,
        }));
        setShorts((prev) => [...prev, ...shuffled]);
      } else {
        setError(err?.message || "Failed to load more shorts");
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, pageSize]);

  // Navigate functions
  const goToNext = useCallback(() => {
    if (activeIndex < shorts.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      // At the very end, immediately trigger loadMore and advance
      loadMore();
    }
  }, [activeIndex, shorts.length, loadMore]);

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

  // Trigger load more when 2 items from the end
  useEffect(() => {
    if (shorts.length > 0 && activeIndex >= shorts.length - 2 && !isLoadingMore) {
      loadMore();
    }
  }, [activeIndex, shorts.length, isLoadingMore, loadMore]);

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
