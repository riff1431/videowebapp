"use client";

import { useState, useCallback } from "react";
import { toggleLikeVideoAction, toggleSubscribeAction } from "@/modules/videos/video.actions";

export interface OptimisticReactionState {
  vote: 1 | 2 | null;
  likes: number;
  dislikes: number;
  isSubscribed: boolean;
}

export function useOptimisticReaction({
  videoDbId,
  channelUserId,
  initialVote = null,
  initialLikes = 0,
  initialDislikes = 0,
  initialSubscribed = false,
  isLoggedIn = false,
  onRequireLogin,
}: {
  videoDbId: number;
  channelUserId: number;
  initialVote?: 1 | 2 | null;
  initialLikes?: number;
  initialDislikes?: number;
  initialSubscribed?: boolean;
  isLoggedIn?: boolean;
  onRequireLogin: () => void;
}) {
  const [reactionState, setReactionState] = useState<OptimisticReactionState>({
    vote: initialVote,
    likes: initialLikes,
    dislikes: initialDislikes,
    isSubscribed: initialSubscribed,
  });

  // Toggle Like / Dislike with optimistic updates and rollback
  const handleVote = useCallback(
    async (type: 1 | 2) => {
      if (!isLoggedIn) {
        onRequireLogin();
        return;
      }

      // Snapshot prior state for rollback
      const prevState = { ...reactionState };

      // Compute optimistic values
      let nextVote: 1 | 2 | null = type;
      let nextLikes = reactionState.likes;
      let nextDislikes = reactionState.dislikes;

      if (reactionState.vote === type) {
        // Toggle off
        nextVote = null;
        if (type === 1) nextLikes = Math.max(0, nextLikes - 1);
        if (type === 2) nextDislikes = Math.max(0, nextDislikes - 1);
      } else {
        // Switched or new vote
        if (type === 1) {
          nextLikes += 1;
          if (reactionState.vote === 2) nextDislikes = Math.max(0, nextDislikes - 1);
        } else {
          nextDislikes += 1;
          if (reactionState.vote === 1) nextLikes = Math.max(0, nextLikes - 1);
        }
      }

      setReactionState((prev) => ({
        ...prev,
        vote: nextVote,
        likes: nextLikes,
        dislikes: nextDislikes,
      }));

      try {
        const res = await toggleLikeVideoAction({ videoDbId, type });
        if (!res.success) {
          // Rollback on server error
          setReactionState(prevState);
        }
      } catch {
        // Rollback on network failure
        setReactionState(prevState);
      }
    },
    [isLoggedIn, onRequireLogin, reactionState, videoDbId]
  );

  // Toggle Subscribe with optimistic update & rollback
  const handleSubscribe = useCallback(async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    const prevSubscribed = reactionState.isSubscribed;
    setReactionState((prev) => ({ ...prev, isSubscribed: !prevSubscribed }));

    try {
      const res = await toggleSubscribeAction({ channelUserId });
      if (!res.success) {
        setReactionState((prev) => ({ ...prev, isSubscribed: prevSubscribed }));
      }
    } catch {
      setReactionState((prev) => ({ ...prev, isSubscribed: prevSubscribed }));
    }
  }, [isLoggedIn, onRequireLogin, reactionState.isSubscribed, channelUserId]);

  return {
    vote: reactionState.vote,
    likes: reactionState.likes,
    dislikes: reactionState.dislikes,
    isSubscribed: reactionState.isSubscribed,
    handleVote,
    handleSubscribe,
  };
}
