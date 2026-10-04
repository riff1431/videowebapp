"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ShortProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export function ShortProgress({
  currentTime,
  duration,
  onSeek,
  className,
}: ShortProgressProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(newPercent * duration);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSeek}
      className={cn(
        "absolute bottom-0 inset-x-0 z-30 group/progress cursor-pointer flex items-end h-4",
        className
      )}
      role="slider"
      aria-label="Video timeline"
      aria-valuemin={0}
      aria-valuemax={duration || 100}
      aria-valuenow={currentTime}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 5));
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + 5));
        }
      }}
    >
      {/* Background Track */}
      <div className="w-full bg-white/20 h-1 group-hover/progress:h-1.5 transition-all relative overflow-hidden">
        {/* Filled Track */}
        <div
          className="h-full bg-[var(--default-brand-red,#2563eb)] transition-all duration-75 relative"
          style={{ width: `${percent}%` }}
        >
          {/* Thumb marker on hover */}
          <div
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-opacity pointer-events-none",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )}
          />
        </div>
      </div>
    </div>
  );
}
