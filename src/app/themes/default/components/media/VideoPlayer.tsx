"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import ReactPlayer with ssr: false to avoid SSR window/document hydration mismatches
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black text-white/50">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});

export interface VideoPlayerProps {
  url: string;
  poster?: string | null;
  autoPlay?: boolean;
  title?: string;
  onEnded?: () => void;
}

export function VideoPlayer({
  url,
  poster,
  autoPlay = false,
  title,
  onEnded,
}: VideoPlayerProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="w-full h-full relative bg-black flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt={title || "Video preview"}
            className="w-full h-full object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center">
      <ReactPlayer
        src={url}
        poster={poster || undefined}
        controls={true}
        playing={autoPlay}
        playsInline={true}
        width="100%"
        height="100%"
        onEnded={onEnded}
      />
    </div>
  );
}
