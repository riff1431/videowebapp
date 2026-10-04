"use client";

import React, { useState } from "react";
import { Video, Film, Clapperboard, Disc, VideoOff, DollarSign } from "lucide-react";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";

type TabType = "videos" | "movies" | "rented_movies" | "rented_videos";

interface VideoItem {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  duration?: string | null;
  views?: number | null;
  createdAt: Date;
  isMovie?: boolean | null;
  user: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
}

interface PaidVideosClientProps {
  purchasedVideos: VideoItem[];
  purchasedMovies: VideoItem[];
  rentedMovies: VideoItem[];
  rentedVideos: VideoItem[];
  initialTab?: TabType;
}

export function PaidVideosClient({
  purchasedVideos = [],
  purchasedMovies = [],
  rentedMovies = [],
  rentedVideos = [],
  initialTab = "videos",
}: PaidVideosClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "videos", label: "Videos", icon: Video },
    { key: "movies", label: "Movies", icon: Film },
    { key: "rented_movies", label: "Rented Movies", icon: Clapperboard },
    { key: "rented_videos", label: "Rented Videos", icon: Disc },
  ];

  let currentItems: VideoItem[] = [];
  let emptyMessage = "No paid videos found";

  if (activeTab === "videos") {
    currentItems = purchasedVideos;
    emptyMessage = "No paid videos found";
  } else if (activeTab === "movies") {
    currentItems = purchasedMovies;
    emptyMessage = "No paid movies found";
  } else if (activeTab === "rented_movies") {
    currentItems = rentedMovies;
    emptyMessage = "No rented movies found";
  } else if (activeTab === "rented_videos") {
    currentItems = rentedVideos;
    emptyMessage = "No rented videos found";
  }

  return (
    <div className="w-full">
      {/* Title Header with Cyan Circle Icon (PlayTube Parity) */}
      <div className="flex items-center gap-2.5 pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
          <DollarSign className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Purchases
        </h1>
      </div>

      {/* Tabs Filter (Exact PlayTube Layout) */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center p-1.5 bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`min-w-[84px] px-4 py-2.5 rounded-xl flex flex-col items-center gap-1.5 text-xs transition-all cursor-pointer ${isActive
                    ? "bg-[#e6f6fd] dark:bg-[#04abf2]/15 text-[#04abf2] font-semibold shadow-2xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 font-medium"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#04abf2]" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State or Video Grid */}
      {currentItems.length === 0 ? (
        <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-5">
            <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.75]" />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {currentItems.map((video) => (
            <VideoCard
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.duration}
              views={video.views}
              createdAt={video.createdAt}
              user={video.user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
