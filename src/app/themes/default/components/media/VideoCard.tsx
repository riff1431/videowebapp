"use client";

import React from "react";
import Link from "next/link";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { Badge } from "@/app/themes/default/components/ui/badge";
import { Avatar } from "@/app/themes/default/components/ui/avatar";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";

export interface VideoCardProps {
  id?: number;
  videoId?: string;
  title?: string;
  thumbnail?: string;
  duration?: string | null;
  views?: number | null;
  createdAt?: Date | string | null;
  user?: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
  channel?: {
    id?: number;
    username: string;
    name?: string | null;
    avatar?: string | null;
    verified?: boolean | null;
  };
  video?: any;
}

export function VideoCard(props: VideoCardProps) {
  const { t } = useTranslation();
  const v = props.video || props;
  const videoId = v.videoId || props.videoId || "";
  const title = v.title || props.title || "Untitled Video";
  const thumbnail = v.thumbnail || props.thumbnail || "";
  const duration = v.duration || props.duration || null;
  const views = v.views ?? props.views ?? 0;

  const channelInfo =
    v.channel ||
    v.user ||
    props.channel ||
    props.user || {
      username: "channel",
      name: "Channel",
      avatar: null,
      verified: false,
    };

  const thumbUrl =
    getPublicImageUrl(thumbnail, "/upload/photos/d-cover.jpg") ||
    "/upload/photos/d-cover.jpg";
  const avatarUrl =
    getPublicImageUrl(channelInfo.avatar, "/upload/photos/d-avatar.jpg") ||
    "/upload/photos/d-avatar.jpg";
  const channelName = channelInfo.name || channelInfo.username || "Channel";

  return (
    <div className="video-card-item group rounded-[22px] p-2.5 transition-all">
      {/* 1. Thumbnail Container (22px radius, duration pill bottom right) */}
      <Link
        href={`/watch/${videoId}`}
        className="block relative aspect-video w-full overflow-hidden rounded-[22px] bg-neutral-200 dark:bg-neutral-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {duration && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <Badge variant="duration">{duration}</Badge>
          </div>
        )}
      </Link>

      {/* 2. Metadata details */}
      <div className="mt-3 flex items-start gap-3 px-1">
        <Link href={`/@${channelInfo.username}`} className="shrink-0 pt-0.5">
          <Avatar
            src={avatarUrl}
            alt={channelName}
            size="md"
            className="ring-1 ring-black/5 dark:ring-white/10"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/watch/${videoId}`} className="block">
            <h3
              title={title}
              className="line-clamp-2 text-xs sm:text-sm font-semibold text-[var(--default-text)] leading-snug group-hover:text-[var(--default-brand-red)] transition-colors"
            >
              {title}
            </h3>
          </Link>

          <Link
            href={`/@${channelInfo.username}`}
            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--default-muted)] hover:text-[var(--default-text)] transition-colors"
          >
            <span className="truncate">{channelName}</span>
            {channelInfo.verified && (
              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
            )}
          </Link>

          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--default-muted)]">
            <span>
              {(views ?? 0).toLocaleString()} {t("views", "views")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
