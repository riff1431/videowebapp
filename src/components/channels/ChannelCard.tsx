"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Users, Video, CheckCircle2, UserPlus, UserCheck } from "lucide-react";
import { toggleSubscribeAction } from "@/modules/videos/video.actions";
import { authClient } from "@/lib/auth/auth-client";
import { getPublicImageUrl } from "@/lib/storage/image-url";

export interface ChannelItem {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
  cover: string | null;
  verified: boolean | null;
  totalViews: number;
  videoCount: number;
  subscriberCount: number;
  rank: number;
  isSubscribed?: boolean;
}

export function ChannelCard({ channel }: { channel: ChannelItem }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [subscribed, setSubscribed] = useState(Boolean(channel.isSubscribed));
  const [subCount, setSubCount] = useState(channel.subscriberCount);
  const [loading, setLoading] = useState(false);

  const handleSubscribeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    // Optimistic update
    const nextSubscribed = !subscribed;
    setSubscribed(nextSubscribed);
    setSubCount((prev) => (nextSubscribed ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleSubscribeAction({ channelUserId: channel.id });
      if (!res.success) {
        // Rollback on failure
        setSubscribed(subscribed);
        setSubCount(channel.subscriberCount);
      }
    } catch {
      setSubscribed(subscribed);
      setSubCount(channel.subscriberCount);
    } finally {
      setLoading(false);
    }
  };

  const displayName = channel.name || channel.username;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative">
      {/* Ranking Badge */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center text-xs font-bold shadow-xs">
        #{channel.rank}
      </div>

      {/* Cover Banner */}
      <div className="h-24 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 overflow-hidden relative">
        <img
          src={getPublicImageUrl(channel.cover, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg"}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>

      {/* Profile info & Avatar */}
      <div className="px-5 pb-5 pt-0 -mt-10 flex flex-col items-center text-center flex-1">
        <Link href={`/channel/${channel.username}`} className="relative block group/avatar">
          <img
            src={getPublicImageUrl(channel.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg"}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-[#1a1a1a] shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-[#04abf2] transition-all"
          />
          {channel.verified && (
            <span
              title="Verified Channel"
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#04abf2] text-white flex items-center justify-center border-2 border-white dark:border-[#1a1a1a] shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#04abf2]" />
            </span>
          )}
        </Link>

        {/* Channel Names */}
        <Link href={`/channel/${channel.username}`} className="mt-2.5 block max-w-full">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#04abf2] transition-colors truncate">
            {displayName}
          </h3>
        </Link>
        <p className="text-xs text-neutral-500 font-normal">@{channel.username}</p>

        {/* Stats Strip */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 w-full grid grid-cols-3 gap-1 text-center">
          <div className="flex flex-col items-center">
            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
              <Eye className="w-3 h-3 text-neutral-400" />
              {Number(channel.totalViews).toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Views</span>
          </div>

          <div className="flex flex-col items-center border-x border-neutral-100 dark:border-neutral-800 px-1">
            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
              <Users className="w-3 h-3 text-neutral-400" />
              {Number(subCount).toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Subs</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
              <Video className="w-3 h-3 text-neutral-400" />
              {Number(channel.videoCount).toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Videos</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 w-full grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSubscribeToggle}
            disabled={loading}
            className={`py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              subscribed
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                : "bg-[#04abf2] hover:bg-[#0399d8] text-white"
            }`}
          >
            {subscribed ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </>
            )}
          </button>

          <Link
            href={`/channel/${channel.username}`}
            className="py-2 px-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl text-center transition-colors flex items-center justify-center shadow-xs"
          >
            Visit
          </Link>
        </div>
      </div>
    </div>
  );
}
