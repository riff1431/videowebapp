"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";

export interface VideoCardProps {
  id?: number;
  videoId?: string;
  title?: string;
  thumbnail?: string;
  duration?: string | null;
  views?: number | null;
  createdAt?: Date | null;
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
  // Support both flattened and nested props (e.g. video={v} or { ...v })
  const v = props.video || props;
  const videoId = v.videoId || props.videoId || "";
  const title = v.title || props.title || "Untitled Video";
  const thumbnail = v.thumbnail || props.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60";
  const duration = v.duration || props.duration || "00:00";
  const views = v.views ?? props.views ?? 0;

  const channelInfo = v.channel || v.user || props.channel || props.user || {
    username: "playtube",
    name: "PlayTube Creator",
    avatar: null,
    verified: false,
  };

  return (
    <div className="group flex flex-col bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--card-border)] hover:shadow-md transition-shadow">
      <Link href={`/watch/${videoId}`} className="relative aspect-video w-full bg-neutral-900 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail || "/upload/photos/d-cover.jpg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[11px] font-medium bg-black/80 text-white rounded">
            {duration}
          </span>
        )}
      </Link>

      <div className="flex gap-3 p-3">
        <Link href={`/channel/${channelInfo.username}`} className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channelInfo.avatar || "/upload/photos/d-avatar.jpg"}
              alt={channelInfo.name || channelInfo.username}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <div className="flex flex-col flex-1 min-w-0">
          <Link
            href={`/watch/${videoId}`}
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight group-hover:text-[var(--primary)] transition-colors mb-1"
            title={title}
          >
            {title}
          </Link>

          <Link
            href={`/channel/${channelInfo.username}`}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <span className="truncate">{channelInfo.name || channelInfo.username}</span>
            {channelInfo.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            )}
          </Link>

          <div className="flex items-center text-[11px] text-neutral-400 mt-0.5">
            <span>{(views ?? 0).toLocaleString()} {t("views", "views")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
