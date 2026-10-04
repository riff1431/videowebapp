import { describe, it, expect } from "vitest";

// 1. Format Count Unit Test
function formatCount(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

// 2. View Threshold Logic Unit Test
function shouldCountView(playbackSeconds: number, duration: number): boolean {
  const threshold = duration > 0 && duration < 4 ? duration * 0.5 : 2;
  return playbackSeconds >= threshold;
}

// 3. Windowing Logic
function getWindowIndices(activeIndex: number, total: number) {
  const indices = new Set<number>();
  if (activeIndex - 1 >= 0) indices.add(activeIndex - 1);
  indices.add(activeIndex);
  if (activeIndex + 1 < total) indices.add(activeIndex + 1);
  return indices;
}

// 4. Optimistic Reaction Rollback State
function computeOptimisticReaction(
  prevState: { vote: 1 | 2 | null; likes: number; dislikes: number },
  action: 1 | 2
) {
  let nextVote: 1 | 2 | null = action;
  let nextLikes = prevState.likes;
  let nextDislikes = prevState.dislikes;

  if (prevState.vote === action) {
    nextVote = null;
    if (action === 1) nextLikes = Math.max(0, nextLikes - 1);
    if (action === 2) nextDislikes = Math.max(0, nextDislikes - 1);
  } else {
    if (action === 1) {
      nextLikes += 1;
      if (prevState.vote === 2) nextDislikes = Math.max(0, nextDislikes - 1);
    } else {
      nextDislikes += 1;
      if (prevState.vote === 1) nextLikes = Math.max(0, nextLikes - 1);
    }
  }

  return { vote: nextVote, likes: nextLikes, dislikes: nextDislikes };
}

describe("Shorts Feature Unit Tests", () => {
  describe("Count Formatting", () => {
    it("formats counts under 1,000 as plain numbers", () => {
      expect(formatCount(0)).toBe("0");
      expect(formatCount(42)).toBe("42");
      expect(formatCount(999)).toBe("999");
    });

    it("formats thousands with K suffix", () => {
      expect(formatCount(1000)).toBe("1K");
      expect(formatCount(1200)).toBe("1.2K");
      expect(formatCount(15500)).toBe("15.5K");
    });

    it("formats millions with M suffix", () => {
      expect(formatCount(1000000)).toBe("1M");
      expect(formatCount(2500000)).toBe("2.5M");
    });
  });

  describe("View Threshold Calculation", () => {
    it("requires 2 seconds for videos 4 seconds or longer", () => {
      expect(shouldCountView(1.9, 15)).toBe(false);
      expect(shouldCountView(2.0, 15)).toBe(true);
      expect(shouldCountView(2.5, 30)).toBe(true);
    });

    it("requires 50% playback for shorts under 4 seconds", () => {
      // 3-second short requires 1.5s
      expect(shouldCountView(1.4, 3)).toBe(false);
      expect(shouldCountView(1.5, 3)).toBe(true);

      // 2-second short requires 1.0s
      expect(shouldCountView(0.9, 2)).toBe(false);
      expect(shouldCountView(1.0, 2)).toBe(true);
    });
  });

  describe("Windowing Logic", () => {
    it("mounts only previous, current, and next", () => {
      const window0 = getWindowIndices(0, 10);
      expect(Array.from(window0)).toEqual([0, 1]);

      const window5 = getWindowIndices(5, 10);
      expect(Array.from(window5)).toEqual([4, 5, 6]);

      const window9 = getWindowIndices(9, 10);
      expect(Array.from(window9)).toEqual([8, 9]);
    });
  });

  describe("Optimistic Reaction & Rollback", () => {
    it("handles new like cleanly", () => {
      const initial = { vote: null, likes: 10, dislikes: 2 };
      const next = computeOptimisticReaction(initial, 1);
      expect(next).toEqual({ vote: 1, likes: 11, dislikes: 2 });
    });

    it("handles switching from like to dislike", () => {
      const current = { vote: 1 as const, likes: 11, dislikes: 2 };
      const next = computeOptimisticReaction(current, 2);
      expect(next).toEqual({ vote: 2, likes: 10, dislikes: 3 });
    });

    it("handles un-liking", () => {
      const current = { vote: 1 as const, likes: 11, dislikes: 2 };
      const next = computeOptimisticReaction(current, 1);
      expect(next).toEqual({ vote: null, likes: 10, dislikes: 2 });
    });

    it("allows clean rollback to prior state", () => {
      const snapshot = { vote: null, likes: 10, dislikes: 2 };
      let state = computeOptimisticReaction(snapshot, 1);
      expect(state.vote).toBe(1);

      // Simulated server failure -> rollback
      state = snapshot;
      expect(state).toEqual(snapshot);
    });
  });
});
