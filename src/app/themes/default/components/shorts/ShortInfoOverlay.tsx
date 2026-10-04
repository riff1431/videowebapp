"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { Button } from "@/app/themes/default/components/ui/button";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { useTranslation } from "@/providers/language-provider";

interface ShortInfoOverlayProps {
  user: {
    id: number;
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
  title: string;
  description?: string | null;
  isSubscribed?: boolean;
  onSubscribe: () => void;
}

export function ShortInfoOverlay({
  user,
  title,
  description,
  isSubscribed = false,
  onSubscribe,
}: ShortInfoOverlayProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const avatarUrl = getPublicImageUrl(user.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg";
  const displayName = user.name || user.username;

  // Format hashtags to search links
  const renderTitleAndHashtags = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        const tag = part.slice(1);
        return (
          <Link
            key={i}
            href={`/search?keyword=${encodeURIComponent(tag)}`}
            className="text-blue-400 hover:underline font-semibold mr-1"
          >
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5 pr-16 sm:pr-20 md:pr-5 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none flex flex-col justify-end text-white">
      {/* Creator Row */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <Link href={`/@${user.username}`} className="shrink-0 group/avatar">
          <Avatar
            src={avatarUrl}
            alt={displayName}
            size="md"
            className="border border-white/30 shadow-md group-hover/avatar:ring-2 group-hover/avatar:ring-white transition-all"
          />
        </Link>

        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <Link
            href={`/@${user.username}`}
            className="text-sm font-semibold hover:underline truncate"
          >
            @{user.username}
          </Link>
          {user.verified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
        </div>

        {/* Subscribe Button */}
        <button
          type="button"
          onClick={onSubscribe}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isSubscribed
              ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs"
              : "bg-white text-black hover:bg-white/90"
          }`}
        >
          {isSubscribed ? t("subscribed", "Subscribed") : t("subscribe", "Subscribe")}
        </button>
      </div>

      {/* Video Title & Expandable Description */}
      <div className="mt-2.5 pointer-events-auto">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer group/desc"
        >
          <p
            className={`text-xs sm:text-sm font-medium leading-snug drop-shadow-xs text-white/95 ${
              isExpanded ? "line-clamp-none" : "line-clamp-2"
            }`}
          >
            {renderTitleAndHashtags(title)}
          </p>
          {description && isExpanded && (
            <p className="text-xs text-white/80 mt-1.5 pt-1.5 border-t border-white/10 whitespace-pre-line">
              {renderTitleAndHashtags(description)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
